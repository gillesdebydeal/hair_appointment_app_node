// Conformément aux exigences POO du Bloc 2, nous utilisons la syntaxe class et des 
// méthodes asynchrones (async/await) pour toutes les interactions avec la base de données.

// Importation des utilitaires : BDD et Bcrypt pour le hachage (Sécurité)
const db = require('../utils/db'); 
const authHelper = require('../utils/authHelper'); 

// Définition de la classe UserModel (respect de la POO)
class UserModel {
    
    constructor() {
        // Définit la table SQL avec laquelle ce modèle interagit
        this.tableName = 'user'; 
    }

    /**
     * Crée un nouvel utilisateur dans la base de données.
     * Intègre le hachage du mot de passe (Sécurité Obligatoire).
     */
    async create(userData) {
        //Sécurité - Cryptage du mot de passe clair
        const hashedPassword = await authHelper.hashPassword(userData.password);

        //Préparation des données pour l'insertion
        const sql = `INSERT INTO ${this.tableName} (email, password_hash, prenom, nom, telephone) 
                    VALUES (?, ?, ?, ?, ?)`;
        
        //Note : userData doit inclure 'password' car il est consommé ici.
        const values = [
            userData.email, 
            hashedPassword, // Le hash est stocké, mais JAMAIS le mot de passe clair
            userData.prenom,
            userData.nom,
            userData.telephone
        ];

        try {
            //Exécution de la requête SQL préparée (Anti-injection)
            const [result] = await db.query(sql, values);
            return result.insertId; // Retourne l'ID du nouvel utilisateur créé
        } catch (error) {
            //Gestion des erreurs (email déjà utilisé...)
            throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
        }
    }

    /**
     * Recherche un utilisateur par son email (pour la connexion).
     */
    async findByEmail(email) {
        // Récupère le hash et l'ID (nécessaires pour la vérification Bcrypt et l'authentification)
        const sql = `SELECT id_user, password_hash, email, nom, prenom FROM ${this.tableName} WHERE email = ?`;
        
        try {
            const [rows] = await db.query(sql, [email]);
            // Retourne le premier utilisateur trouvé (ou null si aucun)
            return rows[0] || null; 
        } catch (error) {
            throw new Error(`Erreur lors de la recherche par email: ${error.message}`);
        }
    }
    
    // --- METHODES FUTURES ---
    
    /**
     * Récupère les informations d'un utilisateur par son ID.
     */
    async findById(id) {
        // TODO: Implémenter la méthode READ.
    }
    
    /**
     * Met à jour les informations de profil (Update).
     */
    async update(id, userData) {
        // TODO: Implémenter la méthode UPDATE.
    }
    
    /**
     * Supprime un utilisateur (Delete - Droit à l'oubli / RGPD).
     */
    async delete(id) {
        // TODO: Implémenter la méthode DELETE.
    }

}

module.exports = UserModel;