// Fichier : app/controllers/CalendarController.js

const ReservationModel = require('../models/ReservationModel'); 
const Sanitizer = require('../utils/sanitizer');
const reservationModel = new ReservationModel(); // Instance du modèle de réservation

class CalendarController {
    
    /**
     * Endpoint: GET /api/calendar/availability?businessId=X&startDate=Y&weeks=Z&prestaId=P&employeeId=E
     * Renvoie les disponibilités pour N semaines à partir d'une date donnée.
     */
    static async getWeeklyAvailability(req, res) {
        // 1. Nettoyage et validation des paramètres
        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId));
        
        // CORRECTION : Récupération du PrestaId de la requête (req.query.prestaId)
        const selectedPrestationId = parseInt(Sanitizer.sanitize(req.query.prestaId)); 
        
        let startDateString = Sanitizer.sanitize(req.query.startDate);
        const weeks = parseInt(Sanitizer.sanitize(req.query.weeks)) || 4; // Par défaut : 4 semaines
        const userRole = Sanitizer.sanitize(req.query.role);
        
        // Récupération de l'ID employé (peut être null)
        const employeeId = Sanitizer.sanitize(req.query.employeeId) === 'null' ? null : parseInt(Sanitizer.sanitize(req.query.employeeId));

        // Validation CLÉ : selectedPrestationId doit être présent.
        if (!businessId || !startDateString || !selectedPrestationId) {
            // Le message d'erreur est plus précis maintenant.
            return res.status(400).json({ message: "Paramètres de calendrier manquants (businessId, startDate, ou prestaId)." });
        }
        
        // 2. LOGIQUE CRITIQUE DE SÉCURITÉ (Gestion de la date passée)
        const today = new Date().toISOString().split('T')[0];
        
        if (userRole === 'CLIENT' && startDateString < today) {
            startDateString = today;
        }

        try {
            const availableCalendar = {};

            // Logique de boucle pour parcourir chaque jour (jusqu'à 4 semaines)
            for (let i = 0; i < weeks * 7; i++) {
                
                const currentDate = new Date(startDateString);
                currentDate.setDate(currentDate.getDate() + i);
                const dateKey = currentDate.toISOString().split('T')[0];
                
                // 2. Appeler le Modèle pour chaque jour
                const availability = await reservationModel.checkAvailability(
                    businessId, 
                    dateKey, 
                    // selectedPrestationId est maintenant défini
                    selectedPrestationId, 
                    employeeId, 
                    null // Reste du code inchangé
                );
                
                // 3. Stockage du résultat
                availableCalendar[dateKey] = availability.availableSlots;
            }

            return res.status(200).json({ 
                message: "Calendrier des disponibilités généré.",
                availability: availableCalendar 
            });

        } catch (error) {
            console.error("Erreur lors de la génération du calendrier:", error);
            // Ajout de l'objet erreur dans la réponse pour le débogage Front-End
            return res.status(500).json({ message: "Erreur serveur lors de la récupération du calendrier.", error: error.message });
        }
    }

        /**
     * Endpoint: GET /api/admin/events?businessId=X&start=YYYY-MM-DD&end=YYYY-MM-DD
     * Renvoie les événements formatés pour FullCalendar.
     */
    static async getAdminEvents(req, res) {
        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId));
        const start = Sanitizer.sanitize(req.query.start); // FullCalendar envoie automatiquement ces paramètres
        const end = Sanitizer.sanitize(req.query.end);

        if (!businessId || !start || !end) {
            return res.status(400).json({ message: "Paramètres manquants." });
        }

        try {
            const rawEvents = await reservationModel.getReservationsByPeriod(businessId, start, end);
            
            // Mapping pour le format FullCalendar (JSON standard)
            const events = rawEvents.map(evt => {
                // Définition des couleurs selon le statut
                let color = '#95a5a6'; // Gris par défaut
                if (evt.statut === 'confirmed') color = '#72e2a8ff'; // Vert (Variable CSS --color-available)
                if (evt.statut === 'pending') color = '#f1b452ff';   // Orange
                if (evt.statut === 'cancelled') color = '#e7877cff'; // Rouge

                return {
                    id: evt.id_reservation,
                    title: `${evt.client_prenom} ${evt.client_nom} - ${evt.prestation_nom}`,
                    start: evt.start,
                    end: evt.end,
                    resourceId: evt.resourceId,
                    backgroundColor: color,
                    borderColor: color,
                    // Données étendues pour le pop-up au clic
                    extendedProps: {
                        clientPhone: evt.telephone,
                        price: evt.tarif_forfait,
                        employee: evt.employe_prenom,
                        status: evt.statut
                    }
                };
            });

            return res.status(200).json(events);

        } catch (error) {
            console.error("Erreur Events Admin:", error);
            return res.status(500).json({ message: "Erreur serveur." });
        }
    }
}

module.exports = CalendarController;