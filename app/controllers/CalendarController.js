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
        
        // Récupération du PrestaId de la requête
        const selectedPrestationId = parseInt(Sanitizer.sanitize(req.query.prestaId)); 
        
        let startDateString = Sanitizer.sanitize(req.query.startDate);
        const weeks = parseInt(Sanitizer.sanitize(req.query.weeks)) || 4; // Par défaut : 4 semaines
        const userRole = Sanitizer.sanitize(req.query.role);
        
        // Récupération de l'ID employé (peut être null)
        const employeeId = Sanitizer.sanitize(req.query.employeeId) === 'null' ? null : parseInt(Sanitizer.sanitize(req.query.employeeId));

        // Validation CLÉ : selectedPrestationId doit être présent.
        if (!businessId || !startDateString || !selectedPrestationId) {
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
                    selectedPrestationId, 
                    employeeId, 
                    null 
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
            return res.status(500).json({ message: "Erreur serveur lors de la récupération du calendrier.", error: error.message });
        }
    }

    /**
     * Endpoint: GET /api/admin/events?businessId=X&start=YYYY-MM-DD&end=YYYY-MM-DD
     * Renvoie les événements formatés pour FullCalendar.
     */
/**
/**
     * Endpoint: GET /api/admin/events?businessId=X&start=YYYY-MM-DD&end=YYYY-MM-DD
     */
    static async getAdminEvents(req, res) {
        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId));
        const start = Sanitizer.sanitize(req.query.start);
        const end = Sanitizer.sanitize(req.query.end);

        if (!businessId || !start || !end) {
            return res.status(400).json({ message: "Paramètres manquants." });
        }

        try {
            // Appel à votre méthode corrigée dans le Modèle
            const rawEvents = await reservationModel.getReservationsByPeriod(businessId, start, end);
            
            // DEBUG : Voir ce que la BDD renvoie exactement dans la console serveur
            if (rawEvents.length > 0) {
                console.log("Exemple de RDV brut:", rawEvents[0]);
            }

            // Mapping pour FullCalendar
            const events = rawEvents.map(evt => {
                // --- GESTION DES COULEURS ET DU STATUT ---
                
                // 1. On récupère le statut et on le met en minuscule pour éviter les bugs (Pending vs pending)
                // Si le champ est vide ou null, on met 'inconnu'
                const statut = evt.statut ? evt.statut.toLowerCase() : 'inconnu';

                // 2. Couleurs par défaut (Gris / Blanc)
                let bgColor = '#6c757d'; 
                let txtColor = '#ffffff'; 

                // 3. Application des règles de couleur
                if (statut === 'confirmed' || statut === 'validé') {
                    bgColor = '#72e2a8';  // Vert
                    txtColor = '#000000'; // Texte Noir
                }
                else if (statut === 'pending' || statut === 'en attente') {
                    bgColor = '#ffc107';  // Orange
                    txtColor = '#000000'; // Texte Noir
                }
                else if (statut === 'cancelled' || statut === 'annulé') {
                    bgColor = '#dc3545';  // Rouge
                    txtColor = '#ffffff'; // Texte Blanc
                }

                // --- CONSTRUCTION DE L'OBJET JSON ---
                return {
                    id: evt.id_reservation,
                    // Titre : "Prénom Nom - Prestation"
                    title: `${evt.client_prenom} ${evt.client_nom} - ${evt.prestation_nom}`,
                    start: evt.start, // Vient de r.date_reservation
                    end: evt.end,     // Vient de r.heure_fin_calculee
                    resourceId: evt.resourceId,
                    
                    // Apparence
                    backgroundColor: bgColor,
                    borderColor: bgColor,
                    textColor: txtColor,

                    // Données supplémentaires pour le clic (Pop-up)
                    extendedProps: {
                        clientPhone: evt.telephone,
                        price: evt.tarif_forfait,
                        employee: evt.employe_prenom,
                        status: statut // On renvoie le statut normalisé (minuscule)
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