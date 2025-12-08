// Fichier : app/controllers/UserController.js

// Importation des Modèles et Utilitaires
const UserModel = require('../models/UserModel'); 
const authHelper = require('../utils/authHelper');       // Utilitaires pour Bcrypt (hachage et comparaison)
const Sanitizer = require('../utils/sanitizer');        // Utilitaires pour nettoyer les entrées (Sécurité XSS/SQL)

// Création d'une instance unique du Modèle Utilisateur pour interagir avec la BDD
const userModel = new UserModel();

class UserController {
    
    /**
     * Gère l'inscription d'un nouvel utilisateur (client).
     * Endpoint: POST /api/auth/register
     */
    static async register(req, res) {
        // 1. Nettoyage des données (Sécurité Anti-XSS/Injection)
        // Le mot de passe est exclu de la désinfection avant le hachage.
        const sanitizedData = {
            email: Sanitizer.sanitize(req.body.email),
            password: req.body.password, 
            prenom: Sanitizer.sanitize(req.body.prenom),
            nom: Sanitizer.sanitize(req.body.nom),
            telephone: Sanitizer.sanitize(req.body.telephone)
        };

        try {
            // 2. Création de l'utilisateur (Le Modèle gère le hachage Bcrypt)
            const userId = await userModel.create(sanitizedData);

            // 3. Logique Rôle : FUTURE : Assigner le rôle 'CLIENT' par défaut dans user_role.
            // Ceci est une étape critique pour l'autorisation future.
            // await userModel.assignRole(userId, 'CLIENT'); 

            // 4. Réponse Front-End
            return res.status(201).json({ 
                message: "Inscription réussie. Bienvenue !", 
                userId: userId 
            });

        } catch (error) {
            // Gestion des erreurs spécifiques (e.g., email déjà utilisé)
            if (error.message.includes('Duplicate entry')) {
                return res.status(409).json({ message: "Cet email est déjà utilisé." });
            }
            // Erreur serveur générique
            return res.status(500).json({ message: "Erreur serveur lors de l'inscription.", error: error.message });
        }
    }
    
    /**
     * Gère la connexion et l'authentification des utilisateurs.
     * Endpoint: POST /api/auth/login
     */
    static async login(req, res) {
        // Les données sont supposées validées par le Front-End (validation JS)
        const { email, password } = req.body;

        try {
            // 1. Chercher l'utilisateur et le hash dans la BDD (Modèle)
            const user = await userModel.findByEmail(email);

            if (!user) {
                // Échec de connexion (pour des raisons de sécurité, réponse générique)
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // 2. Vérification du mot de passe (via Bcrypt)
            const passwordMatch = await authHelper.comparePassword(password, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // 3. AUTHENTIFICATION RÉUSSIE : FUTURE : Créer une session ou un Token JWT
            // Logique future : 
            // - Créer ici un Token JWT pour l'état de connexion.
            // - Déterminer les rôles de l'utilisateur pour le routage Dashboard.
            // const roles = await userModel.getRoles(user.id_user);

            // 4. Réponse Front-End (Indiquer le succès et le rôle de base)
            return res.status(200).json({ 
                message: "Connexion réussie.", 
                userId: user.id_user,
                // Rôle de base pour le routage Front-End (sera géré par JWT/Session dans la version finale)
                role: "CLIENT" 
            });

        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            return res.status(500).json({ message: "Erreur serveur lors de la connexion.", error: error.message });
        }
    }
    
    // FUTURE : Méthode LOGOUT, GET_PROFILE, etc.
}

module.exports = UserController;