// server.js - Version Corrigée (Node 24 Compatible)

// 1. Importations
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// 2. Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Moteur de vue (Optionnel)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. FICHIERS STATIQUES (CRUCIAL)
// C'est cette ligne qui sert automatiquement vos CSS, JS, et HTML dans 'public'
// Si un fichier existe (ex: /pages/reservation.html), il est servi ici.
app.use(express.static(path.join(__dirname, 'public')));

// 6. Routes Spécifiques

// Route Accueil (Racine)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Autres pages (Route dynamique intelligente)
// Si on appelle /prestations, ça charge views/prestations.ejs
app.get('/:page', (req, res) => {
    const page = req.params.page;
    // On rend la page demandée
    res.render(page, (err, html) => {
        if (err) {
            // Si la page n'existe pas (ex: /blabla), erreur 404
            res.status(404).render('404'); // Créez une vue views/404.ejs si vous voulez
        } else {
            res.send(html);
        }
    });
});

// --- CORRECTION DE L'ERREUR ICI ---
// Anciennement app.get('*', ...), nous utilisons maintenant app.use().
// Cela intercepte toutes les requêtes qui n'ont pas été gérées par les lignes au-dessus
// (donc c'est une vraie gestion 404).

app.use((req, res) => {
    // Si on arrive ici, c'est que le fichier n'existe pas dans 'public'
    res.status(404).send(`
        <h1>404 - Page non trouvée</h1>
        <p>Le fichier demandé n'existe pas.</p>
        <a href="/">Retour à l'accueil</a>
    `);
});

// 7. Démarrage du Serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur Front-End Node.js démarré sur http://localhost:${PORT}`);
    console.log(`👉 API Back-End PHP attendue sur http://localhost:8080/hair-appointment-app_nodeJs/api_php.php`);
});