// -----------------------------------------------------------------------------
// CalendarController.js
// Gestion des disponibilités (client) et des agendas (admin / client)
// -----------------------------------------------------------------------------
//
// PRINCIPES D’ARCHITECTURE
// -----------------------------------------------------------------------------
// - Le moteur (ReservationModel) calcule TOUT en minutes (modèle mathématique)
// - Le controller ne fait QUE formater / filtrer les sorties API
// - Aucune logique métier ici
// - Aucune conversion UTC pour les créneaux clients
//
// Séparation stricte des usages :
//   - availability  → créneaux réservables (minutes)
//   - agenda admin  → RDV complets (FullCalendar)
//   - agenda client → RDV anonymisés (zones bloquées)
// -----------------------------------------------------------------------------

const ReservationModel = require('../models/ReservationModel');
const Sanitizer = require('../utils/sanitizer');

const reservationModel = new ReservationModel();

const TimeHelper = require('../utils/timeHelper');

class CalendarController {

    // =========================================================================
    // (1) DISPONIBILITÉ MULTI-JOURS / MULTI-SEMAINES (MOTEUR BRUT)
    // =========================================================================
    // - Appelle checkAvailability() jour par jour
    // - Renvoie un calendrier BRUT (sans format client)
    // =========================================================================
    static async getWeeklyAvailability(req, res) {

        const businessId   = parseInt(Sanitizer.sanitize(req.query.businessId));
        const prestationId = parseInt(Sanitizer.sanitize(req.query.prestaId));
        let startDate      = Sanitizer.sanitize(req.query.startDate);
        const weeks        = parseInt(Sanitizer.sanitize(req.query.weeks)) || 4;
        const role         = Sanitizer.sanitize(req.query.role);

        const employeeId =
            req.query.employeeId && req.query.employeeId !== 'null'
                ? parseInt(Sanitizer.sanitize(req.query.employeeId))
                : null;

        if (!businessId || !startDate || !prestationId) {
            return res.status(400).json({
                message: 'Paramètres manquants (businessId, startDate, prestaId)'
            });
        }

        // Sécurité : un client ne peut pas consulter le passé
        const today = new Date().toISOString().split('T')[0];
        if (role === 'CLIENT' && startDate < today) {
            startDate = today;
        }

        try {
            const calendar = {};

            for (let i = 0; i < weeks * 7; i++) {
                const dateObj = new Date(startDate + 'T12:00:00');
                dateObj.setDate(dateObj.getDate() + i);
                const dateKey = dateObj.toISOString().split('T')[0];

                const availability = await reservationModel.checkAvailability(
                    businessId,
                    dateKey,
                    prestationId,
                    employeeId
                );

                calendar[dateKey] = availability.availableSlots || [];
            }

            return res.status(200).json({
                message: 'Calendrier généré',
                availability: calendar
            });

        } catch (error) {
            console.error('Erreur getWeeklyAvailability :', error);
            return res.status(500).json({
                message: 'Erreur serveur calendrier',
                error: error.message
            });
        }
    }

    // =========================================================================
    // (2) API CLIENT — /calendar/availability
    // =========================================================================
    // ENDPOINT CLÉ POUR LE PARCOURS CLIENT
    //
    // - UNE seule date
    // - UNIQUEMENT les créneaux réservables
    // - Format mathématique (minutes depuis 00:00)
    //
    // Exemple :
    // {
    //   "date": "2026-01-15",
    //   "slots": [
    //     { "startMin": 540, "endMin": 570, "status": "available" }
    //   ]
    // }
    // =========================================================================
    static async getAvailability(req, res) {
    const businessId   = parseInt(Sanitizer.sanitize(req.query.businessId), 10);
    const prestationId = parseInt(Sanitizer.sanitize(req.query.prestaId || req.query.prestationId), 10);

    // date facultative, aujourd’hui par défaut
    const date = Sanitizer.sanitize(req.query.date) || new Date().toISOString().split('T')[0];

    const employeeId =
        req.query.employeeId && req.query.employeeId !== 'null'
        ? parseInt(Sanitizer.sanitize(req.query.employeeId), 10)
        : null;

    if (!businessId || !prestationId) {
        return res.status(400).json({ message: 'Paramètres manquants (businessId, prestaId)' });
    }

    try {
        const availability = await reservationModel.checkAvailability(
        businessId,
        date,
        prestationId,
        employeeId
        );

        const slots = (availability.availableSlots || []).map(slot => {
        // Support des 2 formats possibles renvoyés par generateTimeSlots()
        const startMin =
            typeof slot.startMin === 'number'
            ? slot.startMin
            : TimeHelper.timeToMinutes(slot.start);

        const endMin =
            typeof slot.endMin === 'number'
            ? slot.endMin
            : (slot.end ? TimeHelper.timeToMinutes(slot.end) : startMin + 30);

        return { startMin, endMin, status: 'available' };
        });

        return res.status(200).json({ date, slots });

    } catch (error) {
        console.error('Erreur getAvailability :', error);
        return res.status(500).json({ message: 'Erreur serveur disponibilité', error: error.message });
    }
    }


    // =========================================================================
    // (3) AGENDA ADMIN — COMPLET (FullCalendar)
    // =========================================================================
    static async getAdminEvents(req, res) {

        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId));
        const start      = Sanitizer.sanitize(req.query.start);
        const end        = Sanitizer.sanitize(req.query.end);

        if (!businessId || !start || !end) {
            return res.status(400).json({ message: 'Paramètres manquants.' });
        }

        try {
            const rawEvents = await reservationModel.getReservationsByPeriod(
                businessId,
                start,
                end
            );

            const events = rawEvents.map(evt => {
                const statut = evt.statut ? evt.statut.toLowerCase() : 'inconnu';

                let bgColor = '#6c757d';
                let txtColor = '#ffffff';

                if (statut === 'confirmed' || statut === 'validé') {
                    bgColor = '#72e2a8';
                    txtColor = '#000000';
                } else if (statut === 'pending') {
                    bgColor = '#ffc107';
                    txtColor = '#000000';
                } else if (statut === 'cancelled') {
                    bgColor = '#dc3545';
                }

                return {
                    id: evt.id_reservation,
                    title: `${evt.client_prenom} ${evt.client_nom} - ${evt.prestation_nom}`,
                    start: evt.start,
                    end: evt.end,
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    textColor: txtColor,
                    extendedProps: {
                        clientPhone: evt.telephone,
                        price: evt.tarif_forfait,
                        employee: evt.employe_prenom,
                        status: statut
                    }
                };
            });

            return res.status(200).json(events);

        } catch (error) {
            console.error('Erreur getAdminEvents :', error);
            return res.status(500).json({ message: 'Erreur serveur agenda admin.' });
        }
    }

    // =========================================================================
    // (4) AGENDA CLIENT — ANONYMISÉ (ORANGE UNIQUEMENT)
    // =========================================================================
        // - Pas de nom client
        // - Pas d'ISO "Z"
        // - Format minutes (modèle mathématique)
        // - Le "gris" reste géré par le CSS (par défaut)
        // =========================================================================
        static async getClientAgenda(req, res) {
        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId), 10);
        const date = Sanitizer.sanitize(req.query.date);

    if (!businessId || !date) {
        return res.status(400).json({ message: 'Paramètres manquants (businessId, date).' });
    }

    try {
        const taken = await reservationModel.getTakenBlocksForDay(businessId, date);

        const blocks = taken.map(b => ({
        startMin: b.startMin,
        endMin: b.endMin,
        status: 'unavailable',
        color: 'orange'
        }));

        return res.status(200).json({ date, blocks });

    } catch (error) {
        console.error('Erreur CalendarController.getClientAgenda :', error);
        return res.status(500).json({ message: 'Erreur serveur agenda client.' });
    }
    }


    // =========================================================================
    // (5) ALIAS — /calendar/agenda
    // =========================================================================
    static async getAdminAgenda(req, res) {
        return CalendarController.getAdminEvents(req, res);
    }
}

module.exports = CalendarController;
