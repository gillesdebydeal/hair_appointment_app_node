/**
 * -----------------------------------------------------
 *  SERVER.JS — VERSION UNIFIÉE (API v1 + FRONT + EJS)
 *  Projet : Hair Appointment (Bloc 2 / SaaS)
 * -----------------------------------------------------
 *  Ce serveur a 3 rôles :
 *   1) Servir le FRONT statique (Bloc 1) depuis /public
 *   2) Servir les pages dynamiques .ejs (Back-office / pages métier)
 *   3) Exposer l’API REST versionnée : /api/v1
 *
 *  Structure après refonte :
 *   /public               → HTML/CSS/JS statique
 *   /views/*.ejs          → Rendu serveur
 *   /routes/auth.js       → Authentification (JWT)
 *   /routes/api.js        → API métier (salons, employés, prestations…)
 *   /app/controllers      → Logique métier
 *   /app/models           → Requêtes SQL
 *   /app/utils            → db, helpers, sanitisation, jwt, etc.
 * -----------------------------------------------------
 */

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// // Charge les variables d'environnement
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------
// 1) Middlewares globaux
// ---------------------------------------------

// Autorise les requêtes AJAX venant du front
app.use(cors());

// Permet de parser JSON & formulaires POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------
// 2) Fichiers statiques (FRONT Bloc 1)
// ---------------------------------------------
// Exemple : /assets/css/style.css → public/assets/css/style.css
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------
// 3) Configuration moteur de vues (EJS)
// ---------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------------------------------------------
// 4) Import des routes API versionnées
// ---------------------------------------------
const authRoutes = require('./routes/auth');   // POST /auth/login, register
const apiRoutes  = require('./routes/api');    // /api/... (slots, book, services, employees)

// Préfixage API (versionnée v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', apiRoutes);

// ---------------------------------------------
// 5) Routage FRONT dynamique (pages EJS)
// ---------------------------------------------
/**
 * Exemple : GET /salons → views/salons.ejs
 * Exemple : GET /connexion → views/connexion.ejs
 * Exemple : GET /reservation → views/reservation.ejs
 *
 *  Important :
 *  Si une page n'existe pas, on renvoie une 404 propre.
 */
app.get('/:page', (req, res, next) => {
    // Ne jamais intercepter l'API
    if (req.originalUrl.startsWith('/api/')) {
        return next();
    }

    const page = req.params.page;

    res.render(page, (err, html) => {
        if (err) return next();
        res.send(html);
    });
});


// ---------------------------------------------
// 6) Page d'accueil (FRONT Bloc 1)
// ---------------------------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------------------------------------
// 7) Gestion 404
// ---------------------------------------------
app.use((req, res) => {
    res.status(404).send(`
        <h1>404 - Page non trouvée</h1>
        <p>La ressource demandée n'existe pas.</p>
        <a href="/">Retour à l'accueil</a>
    `);
});

// ---------------------------------------------
// 8) Lancement du serveur
// ---------------------------------------------
app.listen(PORT, () => {
    console.log(`Serveur Hair Appointment démarré sur http://localhost:${PORT}`);
    console.log(`API disponible sur http://localhost:${PORT}/api/v1`);
});

