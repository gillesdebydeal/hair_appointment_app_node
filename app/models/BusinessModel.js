// Fichier : app/models/BusinessModel.js
//
// Ce modèle regroupe toutes les requêtes SQL liées aux salons (business),
// aux prestations, aux services unitaires, aux employés et aux horaires.
// Il sert de couche d'accès aux données pour les contrôleurs.
// Chaque méthode est asynchrone et retourne des données "brutes" venant de MySQL.
// La mise en forme finale (JSON pour l'API, par exemple) se fait dans les controllers.

const db = require('../utils/db'); 

// Définition de la classe BusinessModel (respect de la POO)
class BusinessModel {
    
    constructor() {
        // Table principale pour cette classe (salons)
        this.tableName = 'business'; 

        // Autres tables utilisées par ce modèle
        this.hoursTable = 'business_horaires';              // Horaires d'ouverture des salons
        this.prestationTable = 'prestation';                // Prestations (forfaits visibles par le client)
        this.serviceTable = 'service_unitaire';             // Services unitaires qui composent les prestations
        this.prestationServiceTable = 'prestation_service'; // Table de liaison prestation <-> service
        this.businessUserTable = 'business_user';           // Lien salon <-> user (employés, admin, etc.)
    }

    /**
     * Récupère la liste de tous les salons actifs.
     * Utilisé pour :
     *  - la liste des salons côté client
     *  - le back-office (sélecteur de salon)
     */
    async getAllBusinesses() {
        const sql = `
            SELECT 
                id_business,
                nom,
                description,
                adresse,
                ville,
                code_postal,
                telephone,
                email_contact,
                image_url
            FROM ${this.tableName}
            WHERE actif = 1
            ORDER BY nom ASC
        `;

        try {
            const [rows] = await db.query(sql);
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération de la liste des salons : ${error.message}`);
        }
    }

    /**
     * Récupère les détails complets d'un salon spécifique.
     * Cette méthode sert de base pour :
     *  - l'affichage "Votre salon"
     *  - la fiche salon sur la page de réservation
     *  - le back-office
     */
    async getBusinessById(businessId) {
        const sql = `
            SELECT 
                id_business,
                nom,
                description,
                siret,
                email_contact,
                telephone,
                adresse,
                ville,
                code_postal,
                pays,
                latitude,
                longitude,
                image_url,
                actif
            FROM ${this.tableName}
            WHERE id_business = ?
            LIMIT 1
        `;

        try {
            const [rows] = await db.query(sql, [businessId]);
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération du salon : ${error.message}`);
        }
    }

    /**
     * Méthode utilisée pour la dynamique de la page "Votre Salon".
     * Pour ne pas casser l'existant, elle appelle getBusinessById et renvoie
     * l'objet salon complet. Le contrôleur peut ensuite choisir les champs à afficher.
     */
    async getSalonDetails(businessId) {
        try {
            const salon = await this.getBusinessById(businessId);
            return salon;
        } catch (error) {
            // On garde le message d'origine mais on précise le contexte
            throw new Error(`Erreur lors de la récupération du salon (getSalonDetails) : ${error.message}`);
        }
    }

    /**
     * Récupère les horaires d'ouverture d'un salon.
     * La table business_horaires stocke un enregistrement par jour de la semaine :
     *  - jour_semaine : 0 (dimanche) à 6 (samedi)
     *  - heure_ouverture / heure_fermeture
     *  - éventuelle pause (pause_debut / pause_fin)
     *  - actif : permet de marquer un jour comme fermé
     */
    async getBusinessOpeningHours(businessId) {
        const sql = `
            SELECT
                id_horaire,
                id_business,
                jour_semaine,
                heure_ouverture,
                heure_fermeture,
                pause_debut,
                pause_fin,
                actif
            FROM ${this.hoursTable}
            WHERE id_business = ?
            ORDER BY jour_semaine ASC
        `;

        try {
            const [rows] = await db.query(sql, [businessId]);
            return rows;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des horaires du salon : ${error.message}`);
        }
    }

    /**
     * Calcule la durée totale en minutes d'une prestation complexe.
     * Nécessite une jointure entre 'prestation_service' et 'service_unitaire'.
     * 
     * Remarque :
     *  - Cette méthode calcule uniquement la durée totale à partir des services.
     *  - Dans l'API, on l'utilisera surtout via getPrestationsByBusinessId qui
     *    renvoie des prestations déjà enrichies (durée_totale, services...).
     */
    async getServiceDuration(prestationId) {
        const sql = `
            SELECT SUM(T2.duree_minutes) AS total_duration
            FROM ${this.prestationServiceTable} AS T1
            JOIN ${this.serviceTable} AS T2 
                ON T1.id_service_unitaire = T2.id_service_unitaire
            WHERE T1.id_prestation = ?
        `;

        try {
            // [rows] contient l'objet { total_duration: X }
            const [rows] = await db.query(sql, [prestationId]);
            
            // Retourne la durée totale (ou 0 si non trouvée)
            return rows[0] ? rows[0].total_duration : 0; 
        } catch (error) {
            throw new Error(`Erreur lors du calcul de la durée de la prestation : ${error.message}`);
        }
    }

    /**
     * Récupère les prestations d'un salon, ainsi que les services unitaires
     * qui les composent. La logique métier suivante est appliquée :
     *  - durée_totale : somme des durées des services unitaires liés
     *  - tarif_total :
     *      * si tarif_forfait est renseigné sur la prestation, on l'utilise
     *      * sinon, si un seul service est lié, on utilise son tarif_min
     *      * sinon, on renvoie null (cas rare à éviter en configuration)
     */
    async getPrestationsByBusinessId(businessId) {
        const sql = `
            SELECT
                p.id_prestation,
                p.nom AS prestation_nom,
                p.description AS prestation_description,
                p.type_prestation,
                p.tarif_forfait,
                p.actif AS prestation_active,
                su.id_service_unitaire,
                su.nom AS service_nom,
                su.description AS service_description,
                su.duree_minutes,
                su.duree_blocage,
                su.tarif_min,
                su.tarif_max,
                su.image_url,
                su.actif AS service_actif
            FROM ${this.prestationTable} p
            LEFT JOIN ${this.prestationServiceTable} ps 
                ON ps.id_prestation = p.id_prestation
            LEFT JOIN ${this.serviceTable} su 
                ON su.id_service_unitaire = ps.id_service_unitaire
            WHERE 
                p.id_business = ?
                AND p.actif = 1
            ORDER BY p.nom ASC, su.nom ASC
        `;

        try {
            const [rows] = await db.query(sql, [businessId]);

            // On utilise une Map pour regrouper les lignes par prestation
            const prestationsMap = new Map();

            for (const row of rows) {

                // Si la prestation n'est pas encore créée dans la Map, on l'initialise
                if (!prestationsMap.has(row.id_prestation)) {
                    prestationsMap.set(row.id_prestation, {
                        id: row.id_prestation,
                        nom: row.prestation_nom,
                        description: row.prestation_description,
                        type_prestation: row.type_prestation,
                        // Ces champs seront calculés ci-dessous
                        duree_totale: 0,
                        tarif_total: null,
                        // On garde le tarif_forfait pour l'exposer si besoin
                        tarif_forfait: row.tarif_forfait,
                        services: []
                    });
                }

                const prestation = prestationsMap.get(row.id_prestation);

                // Si aucun service n'est lié (prestation simple), on passe à la suite
                if (!row.id_service_unitaire) {
                    continue;
                }

                // On ignore les services marqués comme inactifs
                if (row.service_actif === 0) {
                    continue;
                }

                // On ajoute le service unitaire à la liste de la prestation
                const service = {
                    id: row.id_service_unitaire,
                    nom: row.service_nom,
                    description: row.service_description,
                    duree: row.duree_minutes,
                    duree_blocage: row.duree_blocage,
                    tarif_min: row.tarif_min,
                    tarif_max: row.tarif_max,
                    image_url: row.image_url
                };

                prestation.services.push(service);
            }

            // Calcul des durées et des tarifs pour chaque prestation
            for (const prestation of prestationsMap.values()) {

                // 1) Calcul de la durée totale = somme des durées unitaires
                let dureeTotale = 0;

                for (const service of prestation.services) {
                    if (typeof service.duree === 'number') {
                        dureeTotale += service.duree;
                    }
                }

                prestation.duree_totale = dureeTotale;

                // 2) Logique tarifaire :
                //    - si un tarif_forfait est défini, c'est lui qui prime
                //    - sinon, si un seul service est lié, on prend tarif_min de ce service
                //    - sinon, on laisse null (cas à traiter côté back-office)
                if (prestation.tarif_forfait !== null && prestation.tarif_forfait !== undefined) {
                    prestation.tarif_total = prestation.tarif_forfait;
                } else if (prestation.services.length === 1) {
                    prestation.tarif_total = prestation.services[0].tarif_min || 0;
                } else {
                    prestation.tarif_total = null;
                }
            }

            return Array.from(prestationsMap.values());

        } catch (error) {
            throw new Error(`Erreur lors de la récupération des prestations du salon : ${error.message}`);
        }
    }

    /**
     * Récupère tous les employés affectés à un salon (pour le choix lors de la réservation).
     * 
     * Cette méthode est définie en static car elle est déjà utilisée dans le
     * BusinessController actuel via BusinessModel.getEmployeesByBusinessId().
     * On la laisse telle quelle pour ne rien casser, mais on pourrait
     * également prévoir une version "instance" si besoin.
     */
    static async getEmployeesByBusinessId(businessId) {
        const sql = `
            SELECT 
                BU.id_business_user AS id,
                U.prenom,
                U.nom,
                U.email,
                U.telephone,
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

    /**
     * Variante "instance" de la méthode précédente.
     * Permet d'appeler this.getEmployeesByBusinessIdInstance(businessId)
     * si l'on travaille avec un objet BusinessModel instancié.
     */
    async getEmployeesByBusinessIdInstance(businessId) {
        return await BusinessModel.getEmployeesByBusinessId(businessId);
    }

    /**
     * Récupère en une seule fois :
     *  - les infos du salon
     *  - ses horaires d'ouverture
     *  - ses prestations (avec services unitaires)
     *  - ses employés
     * 
     * Cette méthode sera très utile pour :
     *  - la page de réservation (détail salon + prestations + choix expert)
     *  - la console admin
     */
    async getBusinessResources(businessId) {
        try {
            const [business, horaires, prestations, employees] = await Promise.all([
                this.getBusinessById(businessId),
                this.getBusinessOpeningHours(businessId),
                this.getPrestationsByBusinessId(businessId),
                this.getEmployeesByBusinessIdInstance(businessId)
            ]);

            return {
                business,
                horaires,
                prestations,
                employees
            };
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des ressources du salon : ${error.message}`);
        }
    }

    // FUTURE : createEmployee(userId, businessId, roleInterne)
    // FUTURE : méthodes CRUD pour prestations et services unitaires
    // FUTURE : getOpeningHours(businessId) pourrait être un alias de getBusinessOpeningHours
}

module.exports = BusinessModel;
