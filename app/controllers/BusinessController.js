/**
 * -----------------------------------------------------------
 *  BusinessController.js
 *  (Contrôleur central pour les salons)
 *
 *  Rôle : Exposer via API toutes les données liées aux salons :
 *   - informations du salon
 *   - horaires (format lisible)
 *   - prestations (avec services unitaires)
 *   - employés
 *   - ressources combinées (pour page réservation)
 *
 *  IMPORTANT :
 *   - Ce controller NE modifie pas le BusinessModel.
 *   - Il formate les données pour le front (EJS ou SPA future).
 * -----------------------------------------------------------
 */

const BusinessModel = require('../models/BusinessModel');
const businessModel = new BusinessModel();

/* -----------------------------------------------------------
 * FORMATAGE DES HORAIRES OPTION B
 * -----------------------------------------------------------
 * Convertit les données brutes SQL en structure lisible :
 *
 * [
 *   {
 *     jour: "Lundi",
 *     ouvert: true,
 *     plages: [
 *       { de: "09:00", a: "12:00" },
 *       { de: "14:00", a: "18:00" }
 *     ]
 *   },
 *   ...
 * ]
 *
 * On découpe automatiquement les pauses.
 */
function formatHoraires(horairesSQL) {

    // Conversion 0–6 → noms des jours FR
    const joursFR = [
        "Dimanche", "Lundi", "Mardi", "Mercredi",
        "Jeudi", "Vendredi", "Samedi"
    ];

    const resultat = [];

    for (const row of horairesSQL) {

        const indexJour = row.jour_semaine;
        const jourNom = joursFR[indexJour] || "Jour inconnu";

        // Si jour fermé
        if (row.actif === 0) {
            resultat.push({
                jour: jourNom,
                ouvert: false,
                plages: []
            });
            continue;
        }

        const ouverture = row.heure_ouverture;
        const fermeture = row.heure_fermeture;

        // 0 = pas de pause
        const pauseDebut = row.pause_debut;
        const pauseFin    = row.pause_fin;

        const plages = [];

        if (pauseDebut && pauseFin) {
            // Plage matin
            plages.push({
                de: ouverture,
                a: pauseDebut
            });

            // Plage après-midi
            plages.push({
                de: pauseFin,
                a: fermeture
            });

        } else {
            // Une seule plage (journée continue)
            plages.push({
                de: ouverture,
                a: fermeture
            });
        }

        resultat.push({
            jour: jourNom,
            ouvert: true,
            plages
        });
    }

    return resultat;
}

/* -----------------------------------------------------------
 *  NOUVELLE CLASSE BusinessController
 * -----------------------------------------------------------
 */
class BusinessController {

    /**
     * GET /api/v1/business
     * Liste de tous les salons actifs (vue catalogue)
     */
    static async getAllBusinesses(req, res) {
        try {
            const salons = await businessModel.getAllBusinesses();
            res.json({ salons });

        } catch (error) {
            console.error("Erreur BusinessController.getAllBusinesses :", error);
            res.status(500).json({ error: "Erreur serveur lors de la liste des salons" });
        }
    }

    /**
     * GET /api/v1/business/:id
     * Informations du salon + horaires formatés OPTION B
     */
    static async getBusinessById(req, res) {
        const businessId = req.params.id;

        try {
            const salon = await businessModel.getBusinessById(businessId);
            if (!salon) {
                return res.status(404).json({ message: "Salon introuvable" });
            }

            const horairesSQL = await businessModel.getBusinessOpeningHours(businessId);
            const horaires = formatHoraires(horairesSQL);

            res.json({
                business: salon,
                horaires
            });

        } catch (error) {
            console.error("Erreur BusinessController.getBusinessById :", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération du salon" });
        }
    }

    /**
     * GET /api/v1/business/:id/prestations
     * Renvoie toutes les prestations + services + durée + tarif_total
     */
    static async getBusinessPrestations(req, res) {
        const businessId = req.params.id;

        try {
            const prestations = await businessModel.getPrestationsByBusinessId(businessId);

            res.json({
                businessId,
                prestations
            });

        } catch (error) {
            console.error("Erreur BusinessController.getBusinessPrestations :", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des prestations" });
        }
    }

    /**
     * GET /api/v1/business/:id/employees
     * Renvoie les employés du salon (utilisé dans page réservation)
     */
    static async getBusinessEmployees(req, res) {
        const businessId = req.params.id;

        try {
            const employees = await businessModel.getEmployeesByBusinessIdInstance(businessId);

            res.json({
                businessId,
                employees
            });

        } catch (error) {
            console.error("Erreur BusinessController.getBusinessEmployees :", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des employés" });
        }
    }

    /**
     * GET /api/v1/business/:id/resources
     * Renvoie :
     *   - salon
     *   - horaires formatés
     *   - prestations
     *   - employés
     * Pour la PAGE RESERVATION (fusion future)
     */
    static async getBusinessResources(req, res) {
        const businessId = req.params.id;

        try {
            const { business, horaires, prestations, employees } =
                await businessModel.getBusinessResources(businessId);

            // Horaires SQL → format OPTION B
            const horairesFormates = formatHoraires(horaires);

            res.json({
                business,
                horaires: horairesFormates,
                prestations,
                employees
            });

        } catch (error) {
            console.error("Erreur BusinessController.getBusinessResources :", error);
            res.status(500).json({ error: "Erreur serveur lors de la récupération des ressources du salon" });
        }
    }
}

module.exports = BusinessController;
