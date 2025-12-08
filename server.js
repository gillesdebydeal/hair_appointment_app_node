// Importations Initiales (les modules Node.js)
const express = require('express');
const dotenv = require('dotenv'); // Importation du module dotenv
const path = require('path');
// const db = require('./app/utils/db'); // <-- NE PAS IMPORTER ICI (pour l'instant)

// Charge les variables du fichier .env EN PREMIER
dotenv.config();

// Après dotenv.config(), nous importons les modules qui lisent process.env
const db = require('./app/utils/db');

const app = express();
const PORT = process.env.PORT || 3000; 

// CONFIGURATION EJS
app.set('view engine', 'ejs');      // Utiliser EJS comme moteur
app.set('views', path.join(__dirname, 'views')); // Dossier des vues

// Middlewares (Configuration des requêtes)
app.use(express.json()); // Lit les données de requêtes JSON (AJAX)
app.use(express.urlencoded({ extended: true })); // Lit les données des formulaires
app.use(express.static(path.join(__dirname, 'public'))); // Sert le dossier public (Front-End Bloc 1)

// MODIFICATION : Route Admin avec récupération des salons
app.get('/admin', async (req, res) => {
    try {
        // 1. On récupère la liste des salons (ID, Nom, Ville)
        // Vérifiez que les noms de colonnes correspondent à votre BDD (ici : id_business, nom, ville)
        const sql = "SELECT * FROM business"; 
        const [salons] = await db.pool.query(sql);

        // 2. On rend la vue en lui passant la variable 'salons'
        res.render('admin-dashboard', { salons: salons });

    } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        // En cas d'erreur, on charge quand même la page mais avec une liste vide pour éviter le crash
        res.render('admin-dashboard', { salons: [] });
    }
});

// ROUTE ACCUEIL
app.get('/', (req, res) => {
    res.render('index'); // Suppose que vous avez créé views/index.ejs
});

// Démarrage du Serveur et Connexion à la BDD
async function startServer() {
    try {
        // Teste la connexion BDD avant de démarrer
        await db.pool.getConnection(); 
        console.log("Connexion MySQL Ok");
        
        // Importation des routes d'authentification et attachement à l'endpoint /api/auth
        const authRoutes = require('./routes/auth');
        app.use('/api/auth', authRoutes); 

        // Importation et attachement des routes principales de l'API
        const apiRoutes = require('./routes/api');
        app.use('/api', apiRoutes); // Ces routes gèrent /api/slots, /api/book, etc.

        app.listen(PORT, () => {
            console.log(`Serveur Node.js démarré sur le port ${PORT}.`);
            console.log(`Accès Front-End: http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Échec de la connexion à la BDD:", error.message);
        process.exit(1); // Arrête le processus en cas d'erreur critique
    }
}

// Lancement
startServer();