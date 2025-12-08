// Fichier : app/models/BusinessModel.js

const db = require('../utils/db'); 

// Définition de la classe BusinessModel (respect de la POO)
class BusinessModel {
    
    constructor() {
        // Table principale pour cette classe
        this.tableName = 'business'; 
    }

    /**
     * Récupère les détails d'un salon spécifique (pour la dynamisation de la page 'Votre Salon').
     */
    async getSalonDetails(businessId) {
        const sql = `SELECT nom, adresse, telephone, email_contact FROM ${this.tableName} WHERE id_business = ?`;
        
        try {
            const [rows] = await db.query(sql, [businessId]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération du salon: ${error.message}`);
        }
    }

    
    /**
     * Calcule la durée totale en minutes d'une prestation complexe.
     * Nécessite une jointure entre 'prestation_service' et 'service_unitaire'.
     */
    async getServiceDuration(prestationId) {
        const sql = `
            SELECT SUM(T2.duree_minutes) AS total_duration
            FROM prestation_service AS T1
            JOIN service_unitaire AS T2 ON T1.id_service_unitaire = T2.id_service_unitaire
            WHERE T1.id_prestation = ?
        `;

        try {
            // [rows] contient l'objet { total_duration: X }
            const [rows] = await db.query(sql, [prestationId]);
            
            // Retourne la durée totale (ou 0 si non trouvée)
            return rows[0] ? rows[0].total_duration : 0; 
        } catch (error) {
            throw new Error(`Erreur lors du calcul de la durée de la prestation: ${error.message}`);
        }
    }
    
/**
     * Récupère tous les employés affectés à un salon (pour le choix lors de la réservation).
     */
    static async getEmployeesByBusinessId(businessId) { // Changement de nom et ajout de 'static'
        const sql = `
            SELECT 
                BU.id_business_user AS id,
                U.prenom,
                U.nom,
                BU.specialites
            FROM business_user BU
            JOIN user U ON BU.id_user = U.id_user
            WHERE BU.id_business = ? 
            AND BU.actif = TRUE 
            AND BU.role_interne = 'employe'
            ORDER BY U.prenom;
        `;
        
        try {
            const [rows] = await db.query(sql, [businessId]);
            return rows; 
        } catch (error) {
            // Utiliser un nom de fonction explicite dans l'erreur pour le débogage
            throw new Error(`Erreur getEmployeesByBusinessId: ${error.message}`); 
        }
    }

    // FUTURE : createEmployee(userId, businessId, roleInterne)
    // FUTURE : getOpeningHours(businessId)
}

module.exports = BusinessModel;