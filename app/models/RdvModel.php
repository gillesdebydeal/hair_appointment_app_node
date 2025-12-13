<?php
class RdvModel {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    // --- CORRECTION 1 : Récupérer les services avec le CALCUL de la durée ---
    public function getServices($businessId) {
        // On fait une JOINTURE pour additionner (SUM) les durées des services unitaires
        // liés à chaque prestation.
        $sql = "SELECT 
                    p.id_prestation, 
                    p.nom, 
                    p.tarif_forfait, 
                    p.description,
                    COALESCE(SUM(su.duree_minutes), 30) as duree_minutes
                FROM prestation p
                LEFT JOIN prestation_service ps ON p.id_prestation = ps.id_prestation
                LEFT JOIN service_unitaire su ON ps.id_service_unitaire = su.id_service_unitaire
                WHERE p.id_business = :id AND p.actif = 1
                GROUP BY p.id_prestation, p.nom, p.tarif_forfait, p.description";
                
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $businessId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // --- CORRECTION 2 : Calculer la durée réelle pour une prestation donnée ---
    public function getPrestationDuration($prestationId) {
        $sql = "SELECT SUM(su.duree_minutes) as total_duration
                FROM service_unitaire su
                JOIN prestation_service ps ON su.id_service_unitaire = ps.id_service_unitaire
                WHERE ps.id_prestation = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $prestationId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Si pas de durée trouvée (ex: prestation vide), on met 30 min par sécurité
        return $result['total_duration'] ? (int)$result['total_duration'] : 30;
    }

    // --- (Gardez vos autres méthodes : getExperts, checkSlotAvailability, etc.) ---
    public function getExperts($businessId) {
        $sql = "SELECT id_user as id, prenom, nom FROM users WHERE role = 'EMPLOYE' AND actif = 1"; 
        // Adaptez si vous avez une liaison business_users, sinon :
        // $sql = "SELECT u.id_user as id, u.prenom, u.nom FROM users u ...";
        $stmt = $this->db->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ... (Le reste de votre fichier RdvModel reste inchangé) ...
    // ... Assurez-vous d'avoir checkSlotAvailability et createRdv ...
    
    // (Je remets checkSlotAvailability pour être sûr que vous l'avez, car elle est critique)
    public function checkSlotAvailability($businessId, $datetimeStart, $duration, $employeeId = null) {
        $start = new DateTime($datetimeStart);
        $end = clone $start;
        $end->modify("+$duration minutes");
        $dateStr = $start->format('Y-m-d');
        $startStr = $start->format('Y-m-d H:i:s');
        $endStr = $end->format('Y-m-d H:i:s');

        // Logique simplifiée : on cherche un expert libre
        // (Dans une version complexe, il faudrait vérifier les horaires d'ouverture)
        
        $sql = "SELECT u.id_user 
                FROM users u 
                WHERE u.role = 'EMPLOYE' 
                AND u.actif = 1";
        
        if ($employeeId) {
            $sql .= " AND u.id_user = :empId";
        }

        // Exclure ceux qui ont déjà un RDV qui chevauche
        $sql .= " AND u.id_user NOT IN (
                    SELECT r.prestataire_id 
                    FROM reservation r 
                    WHERE r.date_reservation < :endStr 
                    AND ADDTIME(r.date_reservation, SEC_TO_TIME(
                        (SELECT COALESCE(SUM(su.duree_minutes), 30) 
                         FROM service_unitaire su
                         JOIN prestation_service ps ON su.id_service_unitaire = ps.id_service_unitaire
                         WHERE ps.id_prestation = r.prestation_id) * 60
                    )) > :startStr
                    AND r.statut != 'ANNULE'
                  )";

        $stmt = $this->db->prepare($sql);
        $params = [
            'startStr' => $startStr,
            'endStr' => $endStr
        ];
        if ($employeeId) $params['empId'] = $employeeId;

        $stmt->execute($params);
        $availablePro = $stmt->fetch(PDO::FETCH_ASSOC);

        return $availablePro ? $availablePro['id_user'] : false;
    }
    
    public function createRdv($data) {
        try {
            $sql = "INSERT INTO reservation (client_id, business_id, prestataire_id, prestation_id, date_reservation, statut)
                    VALUES (:client_id, :business_id, :prestataire_id, :prestation_id, :date_reservation, 'CONFIRME')";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($data);
            return ['success' => true];
        } catch (PDOException $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    
    public function getAllRdvs($userId) {
        // Exemple basique
        return [];
    }
    
    public function deleteRdv($id, $userId) {
        // ...
    }
}
?>