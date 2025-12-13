// -----------------------------------------------------------------------------
// ReservationModel.js
// Moteur central de calcul des disponibilités
// -----------------------------------------------------------------------------

    const db = require('../utils/db');
    const TimeHelper = require('../utils/timeHelper');

    const DEBUG_AVAIL = String(process.env.DEBUG_AVAIL || '0') === '1';
    function dbg(...args) { if (DEBUG_AVAIL) console.log('[AVAIL]', ...args); }

    // Helper : YYYY-MM-DD → jour_semaine SQL (1..7)
    function getSqlDayFromDate(dateStr) {
    const d = new Date(`${dateStr}T12:00:00`);
    const jsDay = d.getDay();          // 0..6 (0=dimanche)
    return jsDay === 0 ? 7 : jsDay;    // 1..7 (7=dimanche)
    }

    // Helper : fabrique "?, ?, ?" et paramètres à plat
    function buildInPlaceholders(values) {
    if (!Array.isArray(values) || values.length === 0) return { sql: '(NULL)', params: [] };
    return { sql: `(${values.map(() => '?').join(',')})`, params: values };
    }

    class ReservationModel {
    constructor() {
        this.tableName = 'reservation';
        this.eventsTable = 'business_evenement_exceptionnel';
        this.hoursTable = 'business_horaires';
        this.employeeHoursTable = 'employee_disponibilites';
        this.employeeAbsencesTable = 'employee_absences';
        this.businessUserTable = 'business_user';
    }

    async getReservationsByPeriod(businessId, startDate, endDate) {
        const sql = `
        SELECT
            r.id_reservation,
            r.date_reservation AS start,
            r.heure_fin_calculee AS end,
            r.statut,
            u.prenom AS client_prenom,
            u.nom AS client_nom,
            u.telephone,
            p.nom AS prestation_nom,
            p.tarif_forfait,
            bu.id_business_user AS resourceId,
            ue.prenom AS employe_prenom
        FROM reservation r
        JOIN user u ON r.id_user_client = u.id_user
        JOIN prestation p ON r.id_prestation = p.id_prestation
        LEFT JOIN business_user bu ON r.id_business_user = bu.id_business_user
        LEFT JOIN user ue ON bu.id_user = ue.id_user
        WHERE r.id_business = ?
            AND r.date_reservation BETWEEN ? AND ?
        ORDER BY r.date_reservation ASC
        `;
        const [rows] = await db.query(sql, [businessId, startDate, endDate]);
        return rows;
    }

        // -----------------------------------------------------------------------------
        // BLOCS "RÉSERVÉ" POUR LE CLIENT (ANONYMISÉ) — format minutes (anti-UTC)
        // -----------------------------------------------------------------------------
        async getBookedBlocksForDay(businessId, date) {
        const sql = `
            SELECT
            DATE_FORMAT(date_reservation, '%H:%i') AS start_time,
            DATE_FORMAT(heure_fin_calculee, '%H:%i') AS end_time
            FROM ${this.tableName}
            WHERE id_business = ?
            AND DATE(date_reservation) = DATE(?)
            AND statut IN ('pending', 'confirmed')
            ORDER BY date_reservation ASC
        `;

        const [rows] = await db.query(sql, [businessId, date]);
        return rows;
        }

        //----------------------------------------------------------------------------------
        // HORAIRES SALON + EXCEPTIONNELS
        // ------------------------------------------------------------------------------


    async getExceptionalHours(businessId, date) {
        const sql = `
        SELECT type_evenement, heure_ouverture, heure_fermeture, pause_debut, pause_fin
        FROM ${this.eventsTable}
        WHERE id_business = ?
            AND date_debut <= ?
            AND date_fin >= ?
        LIMIT 1
        `;
        const [rows] = await db.query(sql, [businessId, date, date]);
        if (!rows.length) return { type: 'REGULAR' };

        const e = rows[0];
        if (e.type_evenement === 'FERMETURE') return { type: 'CLOSED' };

        if (e.type_evenement === 'OUVERTURE') {
        return {
            type: 'OPEN',
            hours: {
            heure_ouverture: e.heure_ouverture,
            heure_fermeture: e.heure_fermeture,
            pause_debut: e.pause_debut,
            pause_fin: e.pause_fin
            }
        };
        }
        return { type: 'REGULAR' };
    }

    async getBusinessHoursForDay(businessId, date) {
        const exceptional = await this.getExceptionalHours(businessId, date);
        if (exceptional.type === 'CLOSED') return null;
        if (exceptional.type === 'OPEN') return exceptional.hours;

        const sqlDay = getSqlDayFromDate(date);
        const sql = `
        SELECT heure_ouverture, heure_fermeture, pause_debut, pause_fin
        FROM ${this.hoursTable}
        WHERE id_business = ?
            AND jour_semaine = ?
            AND actif = 1
        LIMIT 1
        `;
        const [rows] = await db.query(sql, [businessId, sqlDay]);
        return rows[0] || null;
    }

    // ===========================================================================
    // DISPONIBILITÉS — MÉTHODE CLÉ
    // ===========================================================================
    async checkAvailability(businessId, date, prestationId, employeeId = null) {
        dbg('=== START ===', { businessId, date, prestationId, employeeId });

        // 1) Durée de blocage prestation
        let blockingDuration = 30;
        if (prestationId) {
        const sql = `
            SELECT SUM(COALESCE(su.duree_blocage, su.duree_minutes)) AS d
            FROM prestation_service ps
            JOIN service_unitaire su ON ps.id_service_unitaire = su.id_service_unitaire
            WHERE ps.id_prestation = ?
        `;
        const [r] = await db.query(sql, [prestationId]);
        if (r[0]?.d) blockingDuration = parseInt(r[0].d, 10);
        }
        dbg('1) blockingDuration', blockingDuration);

        // 2) Horaires salon
        const businessHours = await this.getBusinessHoursForDay(businessId, date);
        dbg('2) businessHours', businessHours);
        if (!businessHours) {
        dbg('STOP: pas d’horaires salon');
        return { availableSlots: [] };
        }

        // 3) Employés actifs du salon
        let employeeIds = [];
        if (employeeId) {
        employeeIds = [employeeId];
        } else {
        const [rows] = await db.query(
            `SELECT id_business_user FROM ${this.businessUserTable}
            WHERE id_business = ? AND actif = 1`,
            [businessId]
        );
        employeeIds = rows.map(r => r.id_business_user);
        }
        dbg('3) employeeIds actifs', employeeIds);
        if (!employeeIds.length) {
        dbg('STOP: aucun employé actif');
        return { availableSlots: [] };
        }

        // 4) Dispos employés pour ce jour  ✅ CORRIGÉ (IN (...?))
        const sqlDay = getSqlDayFromDate(date);
        dbg('4) sqlDay', sqlDay);

        const inEmp = buildInPlaceholders(employeeIds);
        const empHoursSql = `
        SELECT id_business_user, heure_debut, heure_fin, pause_debut, pause_fin
        FROM ${this.employeeHoursTable}
        WHERE jour_semaine = ?
            AND id_business_user IN ${inEmp.sql}
        `;
        const [empHours] = await db.query(empHoursSql, [sqlDay, ...inEmp.params]);
        dbg('4bis) empHours count', empHours.length);

        if (!empHours.length) {
        dbg('STOP: aucune dispo employé ce jour');
        return { availableSlots: [] };
        }

        const employeeHoursMap = {};
        for (const e of empHours) {
        employeeHoursMap[e.id_business_user] = {
            start: TimeHelper.timeToMinutes(e.heure_debut),
            end: TimeHelper.timeToMinutes(e.heure_fin),
            pauseStart: e.pause_debut ? TimeHelper.timeToMinutes(e.pause_debut) : null,
            pauseEnd: e.pause_fin ? TimeHelper.timeToMinutes(e.pause_fin) : null
        };
        }

        const availableEmployees = Object.keys(employeeHoursMap).map(Number);
        dbg('4ter) availableEmployees', availableEmployees);

        if (!availableEmployees.length) {
        dbg('STOP: employeeHoursMap vide');
        return { availableSlots: [] };
        }

        // 5) Réservations existantes
        const [reservations] = await db.query(
        `SELECT
            DATE_FORMAT(date_reservation, '%H:%i') AS s,
            DATE_FORMAT(heure_fin_calculee, '%H:%i') AS e,
            id_business_user
        FROM ${this.tableName}
        WHERE id_business = ?
            AND DATE(date_reservation) = DATE(?)
            AND statut IN ('pending','confirmed')`,
        [businessId, date]
        );

        const mappedReservations = reservations.map(r => ({
        start: TimeHelper.timeToMinutes(r.s),
        end: TimeHelper.timeToMinutes(r.e),
        emp: r.id_business_user
        }));
        dbg('5) mappedReservations', mappedReservations.length);

        // 6) Absences employés  ✅ CORRIGÉ (IN (...?))
        const inAvailEmp = buildInPlaceholders(availableEmployees);
        const absencesSql = `
        SELECT date_debut, date_fin, heure_debut, heure_fin, id_business_user
        FROM ${this.employeeAbsencesTable}
        WHERE id_business_user IN ${inAvailEmp.sql}
            AND DATE(?) BETWEEN date_debut AND date_fin
        `;
        const [absences] = await db.query(absencesSql, [...inAvailEmp.params, date]);

        const mappedAbsences = absences.map(a => ({
        start: a.heure_debut ? TimeHelper.timeToMinutes(a.heure_debut) : 0,
        end: a.heure_fin ? TimeHelper.timeToMinutes(a.heure_fin) : 1440,
        emp: a.id_business_user,
        full: !a.heure_debut && !a.heure_fin
        }));
        dbg('6) mappedAbsences', mappedAbsences.length);

        // 7) Pause salon
        const salonPauseStart = businessHours.pause_debut ? TimeHelper.timeToMinutes(businessHours.pause_debut) : null;
        const salonPauseEnd = businessHours.pause_fin ? TimeHelper.timeToMinutes(businessHours.pause_fin) : null;
        dbg('7) salonPause', { salonPauseStart, salonPauseEnd });

        // 8) Génération slots
        const allSlots = TimeHelper.generateTimeSlots(
        businessHours.heure_ouverture,
        businessHours.heure_fermeture,
        30
        );
        dbg('8) allSlots.length', allSlots.length);

        const availableSlots = allSlots.filter(slot => {
        const start = TimeHelper.timeToMinutes(slot.start);
        const end = start + blockingDuration;

        // pause salon
        if (salonPauseStart !== null && salonPauseEnd !== null) {
            if (start < salonPauseEnd && end > salonPauseStart) return false;
        }

        // au moins 1 employé dispo + dans ses heures + pas en pause + pas en conflit
        return availableEmployees.some(empId => {
            const h = employeeHoursMap[empId];

            if (start < h.start || end > h.end) return false;

            if (h.pauseStart !== null && h.pauseEnd !== null) {
            if (start < h.pauseEnd && end > h.pauseStart) return false;
            }

            const conflicts = [
            ...mappedReservations.filter(r => r.emp === empId),
            ...mappedAbsences.filter(a => a.emp === empId)
            ];

            return !conflicts.some(c => c.full || (start < c.end && end > c.start));
        });
        });

        dbg('9) availableSlots.length', availableSlots.length);
        dbg('=== END ===');

        return { availableSlots };
    }

    // -----------------------------------------------------------------------------
    // RDV "pris" pour un jour donné (format minutes, anti-UTC)
    // - utilisé par l’agenda client anonymisé
    // -----------------------------------------------------------------------------
    async getTakenBlocksForDay(businessId, date) {
    const sql = `
        SELECT
        DATE_FORMAT(date_reservation, '%H:%i') AS start_time,
        DATE_FORMAT(heure_fin_calculee, '%H:%i') AS end_time
        FROM ${this.tableName}
        WHERE id_business = ?
        AND DATE(date_reservation) = DATE(?)
        AND statut IN ('pending','confirmed')
        ORDER BY date_reservation ASC
    `;

    const [rows] = await db.query(sql, [businessId, date]);

    return rows.map(r => ({
        startMin: TimeHelper.timeToMinutes(r.start_time),
        endMin: TimeHelper.timeToMinutes(r.end_time)
    }));
    }

}

module.exports = ReservationModel;
