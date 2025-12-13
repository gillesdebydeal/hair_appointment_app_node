// Fichier : app/controllers/UserController.js

// Importation des Modèles et Utilitaires
const UserModel = require('../models/UserModel'); 
const authHelper = require('../utils/authHelper');       // Bcrypt : hachage et comparaison
const Sanitizer = require('../utils/sanitizer');         // Nettoyage entrées utilisateur
const jwtHelper = require('../utils/jwtHelper');         // Gestion des JWT (access + refresh)

// Instance du Modèle Utilisateur
const userModel = new UserModel();

class UserController {
    
    /**
     * Inscription d'un nouvel utilisateur (client).
     * Endpoint: POST /api/v1/auth/register
     */
    static async register(req, res) {
        // 1. Nettoyage des données (sécurité XSS/Injection)
        const sanitizedData = {
            email: Sanitizer.sanitize(req.body.email),
            password: req.body.password, 
            prenom: Sanitizer.sanitize(req.body.prenom),
            nom: Sanitizer.sanitize(req.body.nom),
            telephone: Sanitizer.sanitize(req.body.telephone),
        };

        // Validation minimale côté back (complément de la validation front)
        if (!sanitizedData.email || !sanitizedData.password) {
            return res.status(400).json({ message: "Email et mot de passe sont obligatoires." });
        }

        try {
            // 2. Création de l'utilisateur (le Modèle gère le hachage Bcrypt)
            const userId = await userModel.create(sanitizedData);

            // 3. Récupération des informations complètes pour le JWT
            const createdUser = await userModel.findByEmail(sanitizedData.email);

            const userPayload = {
                id: createdUser.id_user,
                email: createdUser.email,
                // Si la colonne role_global n'est pas encore remplie, on considère CLIENT par défaut
                role: createdUser.role_global || 'CLIENT',
            };

            // 4. Génération des tokens
            const accessToken = jwtHelper.generateAccessToken(userPayload);
            const refreshToken = jwtHelper.generateRefreshToken(userPayload);

            // 5. Réponse JSON standardisée
            return res.status(201).json({ 
                message: "Inscription réussie.",
                user: {
                    id: createdUser.id_user,
                    email: createdUser.email,
                    prenom: createdUser.prenom,
                    nom: createdUser.nom,
                    role: userPayload.role,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
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
     * Connexion et authentification des utilisateurs.
     * Endpoint: POST /api/v1/auth/login
     */
    static async login(req, res) {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont obligatoires." });
        }

        try {
            // 1. Recherche de l'utilisateur
            const user = await userModel.findByEmail(email);

            if (!user) {
                // Réponse générique (ne pas dire si l'email existe ou non)
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // 2. Vérification du mot de passe (Bcrypt)
            const passwordMatch = await authHelper.comparePassword(password, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({ message: "Identifiants invalides." });
            }

            // 3. Construction du payload JWT
            const userPayload = {
                id: user.id_user,
                email: user.email,
                role: user.role_global || 'CLIENT',
            };

            // 4. Génération des tokens
            const accessToken = jwtHelper.generateAccessToken(userPayload);
            const refreshToken = jwtHelper.generateRefreshToken(userPayload);

            // 5. Réponse
            return res.status(200).json({ 
                message: "Connexion réussie.",
                user: {
                    id: user.id_user,
                    email: user.email,
                    prenom: user.prenom,
                    nom: user.nom,
                    role: userPayload.role,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            });

        } catch (error) {
            console.error("Erreur lors de la connexion:", error);
            return res.status(500).json({ message: "Erreur serveur lors de la connexion.", error: error.message });
        }
    }

    /**
     * Récupère le profil de l'utilisateur connecté.
     * Endpoint: GET /api/v1/auth/me
     * Protégé par le middleware authenticateToken.
     */
    static async getProfile(req, res) {
        // req.user est injecté par le middleware JWT
        if (!req.user) {
            return res.status(401).json({ message: "Utilisateur non authentifié." });
        }

        return res.status(200).json({
            id: req.user.id,
            email: req.user.email,
            role: req.user.role,
        });
    }

    /**
     * Rafraîchit l'access token à partir d'un refresh token valide.
     * Endpoint: POST /api/v1/auth/refresh
     * Corps attendu : { "refreshToken": "xxx.yyy.zzz" }
     */
    static async refreshToken(req, res) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token manquant." });
        }

        try {
            // Vérifie la validité du refresh token
            const decoded = jwtHelper.verifyRefreshToken(refreshToken);

            const newAccessToken = jwtHelper.generateAccessToken({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
            });

            return res.status(200).json({
                accessToken: newAccessToken,
            });

        } catch (error) {
            return res.status(401).json({ message: "Refresh token invalide ou expiré." });
        }
    }
    
    // FUTURE : méthode logout (invalidation côté base si on stocke les tokens)
}

module.exports = UserController;
