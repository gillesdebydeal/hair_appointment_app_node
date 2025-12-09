<?php
// app/models/RdvModel.php

class RdvModel { // <-- NOM DE CLASSE CORRECT POUR LE MODÈLE
    private $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Tâche 1 : Insère un nouveau rendez-vous. (Méthode POST)
     * La table 'rendez_vous' doit exister dans la base de données.
     * @param array $data Contient: 'prestataire_id', 'client_id', 'date_heure', 'service'.
     */
    public function createRdv(array $data): bool {
        $sql = "INSERT INTO rendez_vous (prestataire_id, client_id, date_heure, service) 
                VALUES (:prestataire_id, :client_id, :date_heure, :service)";
        
        try {
            $stmt = $this->db->prepare($sql);
            
            return $stmt->execute([
                'prestataire_id' => $data['prestataire_id'],
                'client_id'      => $data['client_id'],
                'date_heure'     => $data['date_heure'],
                'service'        => $data['service']
            ]);
        } catch (PDOException $e) {
            // Loguer l'erreur si nécessaire
            // error_log("Erreur Modèle - Création RDV: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Tâche 2 : Modifie un rendez-vous existant. (Méthode PUT)
     * La sécurité est intégrée : seule le client_id enregistré peut modifier ce RDV.
     * @param int $rdvId L'ID du rendez-vous.
     * @param int $userId L'ID de l'utilisateur (client) effectuant la modification.
     * @param array $data Les nouvelles données à enregistrer.
     */
    public function updateRdv(int $rdvId, int $userId, array $data): bool {
        $sql = "UPDATE rendez_vous 
                SET date_heure = :date_heure, service = :service, prestataire_id = :prestataire_id
                WHERE id = :id AND client_id = :client_id"; 

        try {
            $stmt = $this->db->prepare($sql);
            
            // On s'assure que toutes les données nécessaires pour l'UPDATE sont là
            return $stmt->execute([
                'id'             => $rdvId,
                'client_id'      => $userId,
                'date_heure'     => $data['date_heure'],
                'service'        => $data['service'],
                'prestataire_id' => $data['prestataire_id'] 
            ]);
        } catch (PDOException $e) {
            return false;
        }
    }

    /**
     * Tâche 2 : Supprime (annule) un rendez-vous. (Méthode DELETE)
     * La sécurité est intégrée : seule le client_id enregistré peut annuler ce RDV.
     * @param int $rdvId L'ID du rendez-vous.
     * @param int $userId L'ID de l'utilisateur (client) effectuant l'annulation.
     */
    public function deleteRdv(int $rdvId, int $userId): bool {
        $sql = "DELETE FROM rendez_vous WHERE id = :id AND client_id = :client_id";

        try {
            $stmt = $this->db->prepare($sql);
            
            return $stmt->execute([
                'id'        => $rdvId,
                'client_id' => $userId 
            ]);
        } catch (PDOException $e) {
            return false;
        }
    }
}