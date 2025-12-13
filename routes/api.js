/**
 * ----------------------------------------------------------
 * routes/api.js
 * ----------------------------------------------------------
 * Point d’entrée principal de l’API Métier (versionnée v1)
 *
 * Toutes les routes ici seront accessibles via :
 *    http://localhost:3000/api/v1/...
 *
 * Ce fichier regroupe :
 *  - Routes Business (salons, prestations, employés)
 *  - Routes de réservation
 *  - Routes du calendrier (disponibilités / planning)
 *  - Préparation du futur CRUD Admin
 *
 * IMPORTANT :
 *  Ce fichier NE gère pas l’authentification : elle est déjà 
 *  appliquée via authMiddleware sur les routes protégées.
 * ----------------------------------------------------------
 */

const express = require('express');
const router = express.Router();

// Controllers
const BusinessController = require('../app/controllers/BusinessController');
const ReservationController = require('../app/controllers/ReservationController');
const CalendarController = require('../app/controllers/CalendarController');

// JWT Middleware (protection)
const { authenticateToken, authorizeRoles  } = require('../app/utils/authHelper'); 
// Si ton fichier de middleware est différent, je l'adapte facilement.

/* ==========================================================
 *                      BUSINESS
 * ==========================================================
 *  /business
 *  /business/:id
 *  /business/:id/prestations
 *  /business/:id/employees
 *  /business/:id/resources
 * ----------------------------------------------------------
 */

// Liste salons (public)
router.get('/business', BusinessController.getAllBusinesses);

// Infos salon + horaires formatés (public)
router.get('/business/:id', BusinessController.getBusinessById);

// Prestations d'un salon (public)
router.get('/business/:id/prestations', BusinessController.getBusinessPrestations);

// Liste employés (souvent public aussi, Planity-style)
router.get('/business/:id/employees', BusinessController.getBusinessEmployees);

// Ressources complètes : salon + horaires + prestations + employés
router.get('/business/:id/resources', BusinessController.getBusinessResources);


/* ==========================================================
 *                    RÉSERVATIONS
 * ==========================================================
 *  /reservations/book          (client)
 *  /reservations/:id           (admin pour modifier/annuler)
 *  /reservations/client/:id    (historique client)
 * ----------------------------------------------------------
 */

// Réserver un créneau (public ou client logué)
router.post('/reservations/book', ReservationController.createReservation);

// Voir un RDV (admin / superadmin)
router.get('/reservations/:id', authenticateToken, ReservationController.getReservation);

// Modifier un RDV (admin / superadmin)
router.put('/reservations/:id', authenticateToken, ReservationController.updateReservation);

// Annuler un RDV (admin / superadmin)
router.delete('/reservations/:id', authenticateToken, ReservationController.cancelReservation);

// Historique client (sécurisé)
router.get('/reservations/client/:clientId', authenticateToken, ReservationController.getClientReservations);


/* ==========================================================
 *                    CALENDRIER / PLANNING
 * ==========================================================
 *  /calendar/availability      (client)
 *  /calendar/agenda            (admin/superadmin)
 *
 *  La disponibilité fusionnera :
 *   - horaires salon
 *   - exceptions salon
 *   - disponibilités employés
 *   - absences employés
 *   - durées prestations
 *   - RDV existants
 * ----------------------------------------------------------
 */


// Disponibilités pour réservation (public / client)
router.get('/calendar/availability', CalendarController.getAvailability);

// Agenda complet admin (sécurisé)
router.get('/calendar/agenda', authenticateToken, CalendarController.getAdminAgenda);


// Agenda client anonymisé : public (aucune donnée perso, uniquement des blocs orange)
router.get('/calendar/client', CalendarController.getClientAgenda);




/* ==========================================================
 *                    FUTUR CRUD ADMIN
 * ==========================================================
 * Ici seront ajoutées :
 *   POST /business/:id/prestations
 *   PUT  /business/:id/prestations/:id
 *   DELETE ...
 *   POST /service
 *   PUT /service/:id
 *   etc.
 * ----------------------------------------------------------
 */




/* ==========================================================
 * EXPORT
 * ==========================================================
 */

module.exports = router;
