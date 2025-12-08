// Importation du client MySQL pour Node.js.
const mysql = require('mysql2/promise'); 
// Importation des informations de connexion BDD depuis le fichier config.
const config = require('../../config/database'); 

// Création d'un Pool de connexions.
// Le Pool gère les connexions de manière efficace, augmentant les performances serveur.
const pool = mysql.createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true, // Attend qu'une connexion soit disponible si le pool est plein.
    connectionLimit: 10,       // Limite le nombre maximum de connexions simultanées.
    queueLimit: 0              
});

/**
 * Exécute une requête SQL préparée.
 * @param {string} sql - La requête SQL à exécuter.
 * @param {Array} params - Les paramètres de la requête (pour la sécurité anti-injection).
 * @returns {Promise<Array>} Le résultat de la requête.
 */

module.exports = {
    // La méthode pool.execute() est cruciale car elle gère nativement les requêtes préparées.
    query: (sql, params) => pool.execute(sql, params),
    pool: pool 
};