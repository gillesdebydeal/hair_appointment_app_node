// -----------------------------------------------------------------------------
// Fichier : app/controllers/ReservationController.js
// -----------------------------------------------------------------------------
// Gestion des réservations (client & admin)
//
// Contient :
//  - Récupération des créneaux disponibles
//  - Création d'un RDV (createReservation)
//  - Lecture d'un RDV
//  - Mise à jour d'un RDV
//  - Annulation d'un RDV
//  - Historique des RDV d'un client
// -----------------------------------------------------------------------------

const ReservationModel = require('../models/ReservationModel'); 
const BusinessModel = require('../models/BusinessModel'); 
const Sanitizer = require('../utils/sanitizer');

// Instances des modèles
const reservationModel = new ReservationModel();
const businessModel = new BusinessModel();

class ReservationController {

    // -------------------------------------------------------------------------
    // 1) DISPONIBILITÉS JOURNALIÈRES
    // GET /api/v1/calendar/availability?businessId=X&date=YYYY-MM-DD&prestaId=Y[&employeeId=Z]
    // (aujourd’hui surtout appelée via CalendarController, mais on la garde)
    // -------------------------------------------------------------------------
    static async getAvailableSlots(req, res) {
        const businessId   = parseInt(Sanitizer.sanitize(req.query.businessId));
        const requestedDate = Sanitizer.sanitize(req.query.date);
        const prestationId = parseInt(Sanitizer.sanitize(req.query.prestaId));
        const employeeId   = req.query.employeeId
            ? parseInt(Sanitizer.sanitize(req.query.employeeId))
            : null;

        if (!businessId || !requestedDate || !prestationId) {
            return res.status(400).json({ message: "Paramètres manquants." });
        }

        try {
            const availability = await reservationModel.checkAvailability(
                businessId, 
                requestedDate, 
                prestationId, 
                employeeId
            );

            return res.status(200).json({
                message: "Créneaux récupérés.",
                slots: availability.availableSlots || []
            });

        } catch (error) {
            console.error("Erreur getAvailableSlots :", error);
            return res.status(500).json({ 
                message: "Erreur serveur lors de la récupération des disponibilités.",
                error: error.message 
            });
        }
    }

    // -------------------------------------------------------------------------
    // 2) CRÉATION DE RÉSERVATION (API v1 OFFICIELLE)
    // POST /api/v1/reservations/book
    // -------------------------------------------------------------------------
    static async createReservation(req, res) {
        try {
            // FUTUR : clientId récupéré via JWT (req.user.id)
            const clientId = 1; // Temporaire

            const businessId   = parseInt(Sanitizer.sanitize(req.body.businessId));
            const prestationId = parseInt(Sanitizer.sanitize(req.body.prestationId));
            const employeeId   = req.body.employeeId
                ? parseInt(Sanitizer.sanitize(req.body.employeeId))
                : null;
            const dateStart    = Sanitizer.sanitize(req.body.dateStart);

            if (!clientId || !businessId || !prestationId || !dateStart) {
                return res.status(400).json({ message: "Données de réservation incomplètes." });
            }

            // Durée de la prestation (en minutes)
            const durationMinutes = await businessModel.getServiceDuration(prestationId);
            if (!durationMinutes) {
                return res.status(400).json({ message: "Durée de prestation invalide." });
            }

            // Calcul de la date de fin à partir de dateStart + durée
            const dateEnd = new Date(new Date(dateStart).getTime() + durationMinutes * 60000);

            const reservationData = {
                clientId,
                businessId,
                prestationId,
                employeeId,
                dateStart,
                dateEnd: dateEnd.toISOString().slice(0, 19).replace("T", " ")
            };

            const reservationId = await reservationModel.createReservation(reservationData);

            return res.status(201).json({
                message: "Réservation créée avec succès.",
                reservationId
            });

        } catch (error) {
            console.error("Erreur createReservation :", error);
            return res.status(500).json({
                message: "Erreur serveur lors de la création du RDV.",
                error: error.message
            });
        }
    }

    // -------------------------------------------------------------------------
    // 3) LECTURE D'UN RDV (Admin / Superadmin)
    // GET /api/v1/reservations/:id
    // -------------------------------------------------------------------------
    static async getReservation(req, res) {
        const reservationId = parseInt(req.params.id);

        if (!reservationId) {
            return res.status(400).json({ message: "ID réservation manquant." });
        }

        try {
            const rdv = await reservationModel.getReservationById(reservationId);

            if (!rdv) {
                return res.status(404).json({ message: "RDV introuvable." });
            }

            return res.json(rdv);

        } catch (error) {
            console.error("Erreur getReservation :", error);
            return res.status(500).json({
                message: "Erreur serveur lors de la récupération du RDV.",
                error: error.message
            });
        }
    }

    // -------------------------------------------------------------------------
    // 4) MISE À JOUR D'UN RDV (Admin)
    // PUT /api/v1/reservations/:id
    // Corps (JSON) possible :
    //  { dateStart, dateEnd, statut, employeeId }
    // -------------------------------------------------------------------------
    static async updateReservation(req, res) {
        const id = parseInt(req.params.id);

        if (!id) {
            return res.status(400).json({ message: "ID réservation manquant." });
        }

        try {
            const updated = await reservationModel.updateReservation(id, req.body);

            return res.json({
                message: "RDV mis à jour.",
                updated
            });

        } catch (error) {
            console.error("Erreur updateReservation :", error);
            return res.status(500).json({
                message: "Erreur lors de la mise à jour du RDV.",
                error: error.message
            });
        }
    }

    // -------------------------------------------------------------------------
    // 5) ANNULATION D'UN RDV (Admin)
    // DELETE /api/v1/reservations/:id
    // -------------------------------------------------------------------------
    static async cancelReservation(req, res) {
        const id = parseInt(req.params.id);

        if (!id) {
            return res.status(400).json({ message: "ID réservation manquant." });
        }

        try {
            await reservationModel.cancelReservation(id);

            return res.json({
                message: "RDV annulé avec succès."
            });

        } catch (error) {
            console.error("Erreur cancelReservation :", error);
            return res.status(500).json({
                message: "Erreur lors de l'annulation du RDV.",
                error: error.message
            });
        }
    }

    // -------------------------------------------------------------------------
    // 6) HISTORIQUE D'UN CLIENT
    // GET /api/v1/reservations/client/:clientId
    // -------------------------------------------------------------------------
    static async getClientReservations(req, res) {
        const clientId = parseInt(req.params.clientId);

        if (!clientId) {
            return res.status(400).json({ message: "ID client manquant." });
        }

        try {
            const reservations = await reservationModel.getClientReservations(clientId);

            return res.json({
                clientId,
                reservations
            });

        } catch (error) {
            console.error("Erreur getClientReservations :", error);
            return res.status(500).json({
                message: "Erreur lors de la récupération des RDV du client.",
                error: error.message
            });
        }
    }
}

module.exports = ReservationController;
