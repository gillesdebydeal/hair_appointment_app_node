//Ce module gère le hachage (cryptage) des mots de passe en utilisant Bcrypt, 
// le standard de sécurité pour les mots de passe.

// Importe la librairie Bcrypt (installé via npm).
const bcrypt = require('bcrypt');
// Définit le 'salt rounds' (coût du hachage) pour Bcrypt (10 est la valeur standard sécurisée).
//source https://www.npmjs.com/package/bcrypt
const saltRounds = 10; 

/**
 * Hache (crypte) le mot de passe en clair (pour l'inscription).
 * @param {string} plainPassword - Mot de passe entré par l'utilisateur.
 * @returns {Promise<string>} Le hachage sécurisé (password_hash).
 */
async function hashPassword(plainPassword) {
    // Bcrypt génère un salt (grain de sel aléatoire, le fameux Salt Rounds) et hache le mot de passe.
    return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * Compare le mot de passe clair saisi avec le hash stocké (pour la connexion).
 * @param {string} plainPassword - Mot de passe saisi lors de la connexion.
 * @param {string} hash - Le hash stocké dans la base de données.
 * @returns {Promise<boolean>} Vrai si les mots de passe correspondent.
 */
async function comparePassword(plainPassword, hash) {
    // Compare la chaîne de caractères (MDP clair) avec le hachage stocké.
    return await bcrypt.compare(plainPassword, hash);
}

module.exports = {
    hashPassword,
    comparePassword
};