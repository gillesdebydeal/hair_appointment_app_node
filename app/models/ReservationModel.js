const db = require('../utils/db'); 
const TimeHelper = require('../utils/timeHelper'); 

class ReservationModel {
    
    constructor() {
        this.tableName = 'reservation'; 
        this.eventsTable = 'business_evenement_exceptionnel';
        this.hoursTable = 'business_horaires';
        this.employeeHoursTable = 'employee_disponibilites'; 
        this.employeeAbsencesTable = 'employee_absences';
        this.businessUserTable = 'business_user'; 
    }

    // ====================================================================
    // FONCTIONS DE RÉCUPÉRATION DES RÉSERVATIONS
    // ====================================================================
    // Récupération des réservations pour le planning admin
    
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
                bu.id_business_user AS resourceId, -- Pour lier à la colonne employé dans le calendrier
                user_emp.prenom AS employe_prenom
            FROM ${this.tableName} r
            JOIN user u ON r.id_user_client = u.id_user
            JOIN prestation p ON r.id_prestation = p.id_prestation
            LEFT JOIN business_user bu ON r.id_business_user = bu.id_business_user
            LEFT JOIN user user_emp ON bu.id_user = user_emp.id_user
            WHERE r.id_business = ? 
            AND r.date_reservation BETWEEN ? AND ?
            ORDER BY r.date_reservation ASC
        `;
        
        try {
            const [rows] = await db.query(sql, [businessId, startDate, endDate]);
            return rows;
        } catch (error) {
            throw new Error(`Erreur récupération planning admin: ${error.message}`);
        }
    }
    // ====================================================================
    // LOGIQUE DE DÉTERMINATION DES HORAIRES D'OUVERTURE DU SALON
    // ====================================================================

    async getExceptionalHours(businessId, requestedDate) {
        const sql = `
            SELECT type_evenement, heure_ouverture, heure_fermeture, pause_debut, pause_fin
            FROM ${this.eventsTable}
            WHERE id_business = ? AND date_debut <= ? AND date_fin >= ?
            LIMIT 1;
        `;
        
        const [rows] = await db.query(sql, [businessId, requestedDate, requestedDate]);
        
        if (rows.length === 0) {
            return { type: 'REGULAR' };
        }

        const event = rows[0];

        if (event.type_evenement === 'FERMETURE') {
            return { type: 'CLOSED' }; 
        }

        if (event.type_evenement === 'OUVERTURE') { // Correction typo: type_evenEMENT -> type_evenement
            return { 
                type: 'OPEN',
                hours: {
                    heure_ouverture: event.heure_ouverture || '09:00:00', 
                    heure_fermeture: event.heure_fermeture || '18:00:00',
                    pause_debut: event.pause_debut,
                    pause_fin: event.pause_fin
                }
            };
        }
        return { type: 'REGULAR' };
    }

    async getBusinessHoursForDay(businessId, requestedDate) {
        // Pour déterminer le jour de la semaine (0-6), on peut utiliser une Date
        // car cela ne dépend pas de l'heure précise, juste du jour calendrier.
        const dateObj = new Date(requestedDate + 'T12:00:00');
        let dayOfWeek = dateObj.getDay(); 

        const exceptional = await this.getExceptionalHours(businessId, requestedDate);

        if (exceptional.type === 'CLOSED') return null; 
        if (exceptional.type === 'OPEN') return exceptional.hours; 

        const sqlRegular = `
            SELECT heure_ouverture, heure_fermeture, pause_debut, pause_fin
            FROM ${this.hoursTable}
            WHERE id_business = ? AND jour_semaine = ? AND actif = TRUE;
        `;
        const [regularHours] = await db.query(sqlRegular, [businessId, dayOfWeek]);

        if (regularHours.length > 0) return regularHours[0]; 

        return null; 
    }


    // ====================================================================
    // LOGIQUE PRINCIPALE DE DISPONIBILITÉ (Version Finale)
    // ====================================================================

        async checkAvailability(businessId, requestedDate, prestationId, employeeId = null) {
        
        // 1. Déterminer la durée
        let totalClientDuration = 30; 
        let blockingDuration = 30; 

        if (prestationId) {
            const durationSQL = `
                SELECT 
                    SUM(T2.duree_minutes) AS total_client_duration,
                    SUM(COALESCE(T2.duree_blocage, T2.duree_minutes)) AS required_blocking_duration
                FROM prestation_service AS T1
                JOIN service_unitaire AS T2 ON T1.id_service_unitaire = T2.id_service_unitaire
                WHERE T1.id_prestation = ?
            `;
            const [durationData] = await db.query(durationSQL, [prestationId]);
            
            if (durationData && durationData.length > 0 && durationData[0].total_client_duration) {
                 totalClientDuration = parseInt(durationData[0].total_client_duration);
                 blockingDuration = parseInt(durationData[0].required_blocking_duration);
            }
        }
        
        // 2. Horaires et Employés
        const dateObj = new Date(requestedDate + 'T12:00:00');
        const dayOfWeek = dateObj.getDay(); 
        
        let businessHours = await this.getBusinessHoursForDay(businessId, requestedDate);
        if (!businessHours) return { availableSlots: [] }; 

        let activeEmployeesIds = [];
        if (employeeId) {
            activeEmployeesIds = [employeeId];
        } else {
            const employeesSQL = `
                SELECT DISTINCT bu.id_business_user
                FROM ${this.employeeHoursTable} eht
                JOIN ${this.businessUserTable} bu ON eht.id_business_user = bu.id_business_user
                WHERE eht.jour_semaine = ? 
                AND bu.id_business = ? AND bu.actif = 1;
            `;
            const [emps] = await db.query(employeesSQL, [dayOfWeek, businessId]);
            activeEmployeesIds = emps.map(e => e.id_business_user);
        }
        
        if (activeEmployeesIds.length === 0) return { availableSlots: [] };

        // 3. Récupération des conflits
        const reservationsSQL = `
            SELECT 
                DATE_FORMAT(date_reservation, '%H:%i') as start_time,
                DATE_FORMAT(heure_fin_calculee, '%H:%i') as end_time,
                id_business_user
            FROM ${this.tableName}
            WHERE id_business = ? 
            AND DATE(date_reservation) = DATE(?)
            AND statut IN ('pending', 'confirmed');
        `;
        const [rawReservations] = await db.query(reservationsSQL, [businessId, requestedDate]);
        
        const mappedReservations = rawReservations.map(r => ({
            startMin: TimeHelper.timeToMinutes(r.start_time),
            endMin: TimeHelper.timeToMinutes(r.end_time),
            id_business_user: r.id_business_user
        }));

        const absencesSQL = `
            SELECT date_debut, date_fin, heure_debut, heure_fin, id_business_user
            FROM ${this.employeeAbsencesTable}
            WHERE id_business_user IN (?) AND DATE(?) BETWEEN date_debut AND date_fin;
        `;
        let mappedAbsences = [];
        if (activeEmployeesIds.length > 0) {
            const [rawAbsences] = await db.query(absencesSQL, [activeEmployeesIds, requestedDate]);
            mappedAbsences = rawAbsences.map(a => {
                const startMin = a.heure_debut ? TimeHelper.timeToMinutes(a.heure_debut) : 0;
                const endMin = a.heure_fin ? TimeHelper.timeToMinutes(a.heure_fin) : 1440;
                return {
                    startMin, endMin, id_business_user: a.id_business_user,
                    isFullDay: (!a.heure_debut && !a.heure_fin)
                };
            });
        }

        // 4. Pauses Salon
        const salonPauseStart = businessHours.pause_debut ? TimeHelper.timeToMinutes(businessHours.pause_debut) : -1;
        const salonPauseEnd = businessHours.pause_fin ? TimeHelper.timeToMinutes(businessHours.pause_fin) : -1;
        const hasSalonPause = (salonPauseStart >= 0 && salonPauseEnd > salonPauseStart);

        // 5. GÉNÉRATION ET FILTRAGE FINAL
        const allPossibleSlots = TimeHelper.generateTimeSlots(
            businessHours.heure_ouverture, 
            businessHours.heure_fermeture, 
            30 
        );

// --- BLOC DEBUG A INSÉRER AVANT LE FILTER ---
        console.log("=== DEBUG PAUSE ===");
        console.log("Heure Serveur (Brut SQL) :", businessHours.pause_debut);
        console.log("Heure Convertie (Minutes):", salonPauseStart);
        console.log("Créneau 11:00 (660min) chevauche pause ?", (660 < salonPauseEnd && (660 + blockingDuration) > salonPauseStart));
        console.log("Nb Réservations conflictuelles :", mappedReservations.length);
        console.log("===================");
        // ---------------------------------------------

        const availableSlots = allPossibleSlots.filter(slotObj => {
            
            const slotStartMins = TimeHelper.timeToMinutes(slotObj.start);
            const slotEndMins = slotStartMins + blockingDuration; // Variable définie ici avec un 's'

            // A. VÉRIFICATION DE LA PAUSE SALON
            if (hasSalonPause) {
                // Correction ici : utilisation de slotEndMins (avec s)
                if (slotStartMins < salonPauseEnd && slotEndMins > salonPauseStart) {
                    return false; 
                }
            }
            
            // B. VÉRIFICATION DES CONFLITS EMPLOYÉS
            let availableCount = 0;

            for (const empId of activeEmployeesIds) {
                let isFree = true;
                
                const empConflicts = [
                    ...mappedReservations.filter(r => r.id_business_user === empId),
                    ...mappedAbsences.filter(a => a.id_business_user === empId)
                ];

                for (const conflict of empConflicts) {
                    if (conflict.isFullDay) { isFree = false; break; }

                    // Correction ici aussi : utilisation de slotEndMins (avec s)
                    if (slotStartMins < conflict.endMin && slotEndMins > conflict.startMin) {
                        isFree = false; 
                        break; 
                    }
                }
                
                if (isFree) { availableCount++; break; }
            }

            return availableCount > 0;
        });

        return { availableSlots: availableSlots, totalClientDuration: totalClientDuration }; 
    }

    // ====================================================================
    // Autres Fonctions (Création de RDV, Historique) - Inchangées
    // ====================================================================

    async createReservation(reservationData) {
        const sql = `INSERT INTO ${this.tableName} (id_user_client, id_business, id_business_user, id_prestation, date_reservation, heure_fin_calculee)
                    VALUES (?, ?, ?, ?, ?, ?)`;
        
        const values = [
            reservationData.clientId,
            reservationData.businessId,
            reservationData.employeeId,
            reservationData.prestationId,
            reservationData.dateStart, // Format attendu : 'YYYY-MM-DD HH:mm:ss'
            reservationData.dateEnd 
        ];
        
        try {
            const [result] = await db.query(sql, values);
            return result.insertId;
        } catch (error) {
            throw new Error(`Erreur lors de la création de la réservation: ${error.message}`);
        }
    }
    
    async updateStatus(reservationId, newStatus) {
        const sql = `UPDATE ${this.tableName} SET statut = ?, date_modification = NOW() WHERE id_reservation = ?`;
        
        try {
            const [result] = await db.query(sql, [newStatus, reservationId]);
            return result.affectedRows; 
        } catch (error) {
            throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
        }
    }
    
    async getHistoryByClient(clientId) {
        const sql = `
            SELECT T1.*, T2.nom AS prestation_nom 
            FROM ${this.tableName} AS T1
            JOIN prestation AS T2 ON T1.id_prestation = T2.id_prestation
            WHERE T1.id_user_client = ?
            ORDER BY T1.date_reservation DESC
        `;
        const [rows] = await db.query(sql, [clientId]);
        return rows;
    }
}

module.exports = ReservationModel;