// Fichier : app/middleware/authMiddleware.js
//
// Rôle : intercepter les requêtes sur les routes protégées,
// vérifier le JWT d'accès, et exposer les infos utilisateur dans req.user.
//
// Utilisation typique dans les routes :
// router.get('/profile', authenticateToken, UserController.getProfile);

const jwtHelper = require('../utils/jwtHelper');

/**
 * Middleware d'authentification basé sur l'access token JWT.
 *
 * - Récupère le header Authorization: "Bearer <token>"
 * - Vérifie la signature et l'expiration du token
 * - Place les infos utilisateur dans req.user
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Format attendu : "Bearer xxxxx.yyyyy.zzzzz"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token d'accès manquant." });
    }

    try {
        const decoded = jwtHelper.verifyAccessToken(token);

        // On expose uniquement les champs utiles dans la requête
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };

        return next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
}

module.exports = {
    authenticateToken,
};
