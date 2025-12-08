// Fichier : routes/api.js

const express = require('express');
const router = express.Router();
// Importation des Contrôleurs nécessaires pour cette API :
const ReservationController = require('../app/controllers/ReservationController');
const CalendarController = require('../app/controllers/CalendarController');
const BusinessController = require('../app/controllers/BusinessController'); // (Pour les services/salons)
// const ReviewController = require('../app/controllers/ReviewController');     // (Pour les avis)

// ----------------------------------------------------------------------
// A. ROUTAGE DES DISPONIBILITÉS ET RÉSERVATIONS
// ----------------------------------------------------------------------

// Endpoint 1 : GET /api/slots
// Récupère les créneaux disponibles pour une date/prestation donnée.
// Utilise la méthode GET car elle récupère des données (n'a pas d'effet secondaire).
router.get('/slots', ReservationController.getAvailableSlots);


// Endpoint 2 : POST /api/book
// Enregistre une nouvelle réservation.
// Utilise la méthode POST car elle crée une nouvelle ressource.
// FUTURE : Nécessitera un middleware d'authentification (vérification du Token JWT)
// router.post('/book', authMiddleware, ReservationController.bookReservation);
router.post('/book', ReservationController.bookReservation);
router.get('/calendar/availability', CalendarController.getWeeklyAvailability);
router.get('/business/employees', BusinessController.listEmployees);

// ----------------------------------------------------------------------
// B. ROUTAGE DES DONNÉES STATIQUES / RECHERCHE (Exemples)
// ----------------------------------------------------------------------

// Endpoint 3 : GET /api/services
// Récupère le catalogue des prestations pour le Front-End.
// router.get('/services', BusinessController.getAllPrestations);

// Endpoint 4 : GET /api/reviews
// Récupère la liste des avis clients à afficher.
// router.get('/reviews', ReviewController.getVisibleReviews);

// --- Routes Admin Dashboard ---
// GET /api/admin/events (Pour alimenter le calendrier)
router.get('/admin/events', CalendarController.getAdminEvents);

// Exporte le routeur pour qu'il puisse être attaché au serveur.js
module.exports = router;