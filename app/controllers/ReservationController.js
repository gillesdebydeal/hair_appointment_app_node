// Fichier : app/controllers/ReservationController.js

// Importation des Modèles et Utilitaires
const ReservationModel = require('../models/ReservationModel'); 
const BusinessModel = require('../models/BusinessModel'); 
const UserModel = require('../models/UserModel'); 
const Sanitizer = require('../utils/sanitizer'); // Pour nettoyer les entrées utilisateur

// Création des instances des modèles pour l'interaction BDD
const reservationModel = new ReservationModel();
const businessModel = new BusinessModel();
// const userModel = new UserModel(); // Non nécessaire directement ici, car l'ID client doit être dans le JWT/Session

class ReservationController {
    
    /**
     * Endpoint: GET /api/slots?businessId=X&date=Y&prestaId=Z[&employeeId=W]
     * Gère la récupération des créneaux horaires disponibles.
     */
    static async getAvailableSlots(req, res) {
        // 1. Récupération et désinfection des paramètres de la requête
        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId));
        const requestedDate = Sanitizer.sanitize(req.query.date);
        const prestationId = parseInt(Sanitizer.sanitize(req.query.prestaId));
        // L'employé est facultatif
        const employeeId = req.query.employeeId ? parseInt(Sanitizer.sanitize(req.query.employeeId)) : null;

        // 2. Validation de base des données d'entrée
        if (!businessId || !requestedDate || !prestationId) {
            return res.status(400).json({ message: "Paramètres de recherche de créneau manquants." });
        }
        
        try {
            // 3. Appel du Modèle de Réservation pour le calcul complexe
            // Le Modèle orchestre les requêtes (horaires, absences, RDV existants) et exécute l'algorithme JS.
            const availability = await reservationModel.checkAvailability(
                businessId, 
                requestedDate, 
                prestationId, 
                employeeId
            );

            // 4. Réponse
            if (availability.availableSlots.length === 0) {
                return res.status(200).json({ message: "Aucun créneau disponible pour cette sélection.", slots: [] });
            }

            return res.status(200).json({ 
                message: "Créneaux récupérés avec succès.",
                slots: availability.availableSlots 
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des créneaux:", error);
            return res.status(500).json({ message: "Erreur serveur lors de la vérification des disponibilités.", error: error.message });
        }
    }
    
    /**
     * Endpoint: POST /api/book
     * Gère la création finale d'une réservation (RDV).
     */
    static async bookReservation(req, res) {
        // 1. Logique d'Authentification (FUTURE : Récupérer l'ID utilisateur du Token JWT)
        // const clientId = req.userId; // Supposons que le middleware JWT place l'ID dans req.userId
        const clientId = 1; // Simulation de l'ID utilisateur pour le développement

        // 2. Récupération et désinfection des données du formulaire de réservation
        const businessId = parseInt(Sanitizer.sanitize(req.body.businessId));
        const prestationId = parseInt(Sanitizer.sanitize(req.body.prestationId));
        const employeeId = req.body.employeeId ? parseInt(Sanitizer.sanitize(req.body.employeeId)) : null;
        const dateStart = Sanitizer.sanitize(req.body.dateStart); // DATETIME sélectionné
        
        // 3. Validation de base
        if (!clientId || !prestationId || !dateStart) {
            return res.status(400).json({ message: "Données de réservation incomplètes ou utilisateur non identifié." });
        }
        
        try {
            // 4. Calcul de l'heure de fin (Utilisation du BusinessModel)
            const durationMinutes = await businessModel.getServiceDuration(prestationId);

            if (durationMinutes === 0) {
                return res.status(400).json({ message: "Durée de la prestation invalide." });
            }
            
            // Calcul de la fin (Logique critique pour la BDD - Nécessite une manipulation de date/heure)
            // En Node.js, cela se fait via l'objet Date : 
            const dateEnd = new Date(new Date(dateStart).getTime() + durationMinutes * 60000); 
            
            // 5. DOUBLE VÉRIFICATION DE DISPONIBILITÉ (Sécurité Back-End)
            // On vérifie que le créneau n'a pas été pris entre-temps par un autre client.
            // *****On pourrait appeler ici une version simplifiée de checkAvailability,
            // *****ou effectuer une vérification SQL ciblée (SQL LOCK).
            
            // 6. Préparation des données finales
            const reservationData = {
                clientId: clientId,
                businessId: businessId,
                employeeId: employeeId,
                prestationId: prestationId,
                dateStart: dateStart,
                dateEnd: dateEnd.toISOString().slice(0, 19).replace('T', ' ') // Format SQL DATETIME
            };
            
            // 7. Enregistrement de la Réservation (Modèle)
            const reservationId = await reservationModel.createReservation(reservationData);
            
            // FUTURE : Envoyer la notification de confirmation au client (via NotificationModel)

            // 8. Réponse Front-End
            return res.status(201).json({ 
                message: "Réservation enregistrée avec succès.", 
                reservationId: reservationId 
            });

        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la réservation:", error);
            return res.status(500).json({ message: "Erreur interne lors de la réservation.", error: error.message });
        }
    }
    
    // FUTURE : static async cancelReservation(req, res) { ... }
}

module.exports = ReservationController;