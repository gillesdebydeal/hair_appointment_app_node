<?php
// Fichier : app/models/RdvModel.php

class RdvModel {
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    // Récupère la liste des services (Pour le menu déroulant)
    public function getServices(int $businessId): array {
        $sql = "SELECT id_prestation, nom, tarif_forfait FROM prestation WHERE id_business = :id AND actif = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $businessId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getExperts(int $businessId): array {
        $sql = "SELECT bu.id_business_user as id, u.prenom, u.nom 
                FROM business_user bu 
                JOIN user u ON bu.id_user = u.id_user 
                WHERE bu.id_business = :id AND bu.actif = 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $businessId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPrestationDuration(int $prestationId): int {
        $sql = "SELECT SUM(su.duree_minutes) as total 
                FROM service_unitaire su
                JOIN prestation_service ps ON su.id_service_unitaire = ps.id_service_unitaire
                WHERE ps.id_prestation = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $prestationId]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int) ($res['total'] ?? 30);
    }

    public function checkSlotAvailability($businessId, $datetimeStart, $duration, $specificEmployeeId = null) {
        $start = new DateTime($datetimeStart);
        $end = clone $start;
        $end->add(new DateInterval('PT' . $duration . 'M'));
        $dayIndex = (int)$start->format('N'); // 1=Lundi

        $sql = "SELECT bu.id_business_user 
                FROM business_user bu
                JOIN employee_disponibilites ed ON bu.id_business_user = ed.id_business_user
                WHERE bu.id_business = :bid AND bu.actif = 1
                AND (:empid IS NULL OR bu.id_business_user = :empid)
                AND ed.jour_semaine = :day
                AND ed.heure_debut <= :tstart 
                AND ed.heure_fin >= :tend
                AND (ed.pause_debut IS NULL OR NOT (:tstart < ed.pause_fin AND :tend > ed.pause_debut))
                AND NOT EXISTS (
                    SELECT 1 FROM reservation r
                    WHERE r.id_business_user = bu.id_business_user
                    AND r.statut != 'cancelled'
                    AND r.date_reservation < :dtend
                    AND r.heure_fin_calculee > :dtstart
                )
                LIMIT 1";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'bid' => $businessId,
                'empid' => $specificEmployeeId,
                'day' => $dayIndex,
                'tstart' => $start->format('H:i:s'),
                'tend' => $end->format('H:i:s'),
                'dtstart' => $start->format('Y-m-d H:i:s'),
                'dtend' => $end->format('Y-m-d H:i:s')
            ]);
            $res = $stmt->fetch(PDO::FETCH_ASSOC);
            return $res ? $res['id_business_user'] : null;
        } catch (PDOException $e) { return null; }
    }

    public function createRdv(array $data) {
        try {
            $duree = $this->getPrestationDuration($data['prestation_id']);
            $start = new DateTime($data['date_reservation']);
            $end = clone $start;
            $end->add(new DateInterval('PT' . $duree . 'M'));

            $sql = "INSERT INTO reservation (id_user_client, id_business, id_business_user, id_prestation, date_reservation, heure_fin_calculee, statut)
                    VALUES (:cli, :bus, :pro, :pres, :start, :end, 'confirmed')";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'cli' => $data['client_id'],
                'bus' => $data['business_id'],
                'pro' => $data['prestataire_id'],
                'pres' => $data['prestation_id'],
                'start' => $start->format('Y-m-d H:i:s'),
                'end' => $end->format('Y-m-d H:i:s')
            ]);
            return ['success' => $result, 'id' => $this->db->lastInsertId()];
        } catch (Exception $e) { return ['success' => false, 'error' => $e->getMessage()]; }
    }

    public function deleteRdv(int $id, int $userId) {
        $stmt = $this->db->prepare("DELETE FROM reservation WHERE id_reservation = ? AND id_user_client = ?");
        return $stmt->execute([$id, $userId]);
    }
    
    public function getAllRdvs(int $userId): array {
        $sql = "SELECT r.id_reservation, r.date_reservation, p.nom as prestation_nom, u.prenom as pro_prenom 
                FROM reservation r 
                JOIN prestation p ON r.id_prestation = p.id_prestation 
                LEFT JOIN business_user bu ON r.id_business_user = bu.id_business_user 
                LEFT JOIN user u ON bu.id_user = u.id_user 
                WHERE r.id_user_client = :uid ORDER BY r.date_reservation DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['uid' => $userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>