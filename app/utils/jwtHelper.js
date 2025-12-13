// Fichier : app/utils/jwtHelper.js
//

// Rappel rapide : principe JWT
// Quand l’utilisateur se connecte (login) : On vérifie l’email + mot de passe.

// Si OK, on génère deux jetons signés avec la clé .env :
// -access token (durée courte, ex. 15 minutes)
// -refresh token (durée longue, ex. 7 jours)
// -À chaque requête protégée (/api/v1/reservations, /api/v1/admin/...) :
// -Le front envoie Authorization: Bearer <accessToken>.
// -Le middleware vérifie la signature et extrait id, email, role.

// Quand l’access token expire :

// -Le front appelle /api/v1/auth/refresh avec le refresh token.
// -Le serveur vérifie le refresh token et renvoie un nouvel access token.

//-------------------------------------------------------------
// JWT Helper
//-------------------------------------------------------------

// Rôle : centraliser toute la logique liée aux JSON Web Tokens (JWT)
// - Génération d'un access token (durée courte)
// - Génération d'un refresh token (durée plus longue)
// - Vérification et décodage des deux types de tokens

const jwt = require('jsonwebtoken');

// Chargement des variables d'environnement
// (server.js appelle déjà dotenv.config(), mais on prévoit le cas général)
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'dev_access_secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_TOKEN_SECRET;

// Durées d'expiration (format : "15m", "7d", "1h"...)
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_EXPIRES || '7d';

/**
 * Génère un access token signé pour un utilisateur donné.
 * L'access token contient les informations minimales nécessaires
 * pour identifier l'utilisateur dans les routes protégées.
 *
 * @param {{ id: number, email: string, role: string }} payload
 * @returns {string} Jeton JWT signé.
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
}

/**
 * Génère un refresh token signé.
 * Le payload est le même que pour l'access token, mais la durée est plus longue.
 *
 * @param {{ id: number, email: string, role: string }} payload
 * @returns {string} Jeton JWT signé.
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRATION,
    });
}

/**
 * Vérifie et décode un access token.
 * Lève une exception si le token est invalide ou expiré.
 *
 * @param {string} token
 * @returns {{ id: number, email: string, role: string, iat: number, exp: number }}
 */
function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

/**
 * Vérifie et décode un refresh token.
 * Lève une exception si le token est invalide ou expiré.
 *
 * @param {string} token
 * @returns {{ id: number, email: string, role: string, iat: number, exp: number }}
 */
function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
