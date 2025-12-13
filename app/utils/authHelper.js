// Ce module gère :
// - le hachage des mots de passe (bcrypt)
// - la vérification des tokens JWT (auth middleware)

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

/**
 * Hache le mot de passe en clair
 */
async function hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Compare mot de passe clair / hash
 */
async function comparePassword(plainPassword, hash) {
    return await bcrypt.compare(plainPassword, hash);
}

/**
 * Middleware d'authentification JWT
 * Utilisé pour protéger les routes admin / client
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Format attendu : "Bearer xxx.yyy.zzz"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token manquant' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token invalide ou expiré' });
        }

        // Données utilisateur disponibles dans toute la requête
        req.user = decoded;
        next();
    });
}

function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accès interdit' });
        }
        next();
    };
}


module.exports = {
    hashPassword,
    comparePassword,
    authenticateToken,
    authorizeRoles
};
