// Fichier : app/controllers/BusinessController.js 

const BusinessModel = require('../models/BusinessModel');
const Sanitizer = require('../utils/sanitizer');

class BusinessController {

    /**
     * Endpoint: GET /api/business/employees?businessId=X
     * Renvoie la liste des employés actifs du salon.
     */
    static async listEmployees(req, res) {
        const businessId = parseInt(Sanitizer.sanitize(req.query.businessId));

        if (!businessId) {
            return res.status(400).json({ message: "ID de l'entreprise (businessId) manquant." });
        }

        try {
            const employees = await BusinessModel.getEmployeesByBusinessId(businessId);
            
            return res.status(200).json({ 
                message: "Liste des employés récupérée.", 
                employees: employees 
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des employés:", error);
            return res.status(500).json({ message: "Erreur interne du serveur lors de l'accès aux données des employés." });
        }
    }
}

module.exports = BusinessController;