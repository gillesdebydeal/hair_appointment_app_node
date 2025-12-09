<?php
// Controllers/RdvController.php

class RdvController {
    private $rdvModel;

    public function __construct(RdvModel $rdvModel) {
        $this->rdvModel = $rdvModel;
    }

    public function create() {
        // 1. Le Middleware a garanti que $_SESSION['user_id'] existe.
        $client_id = $_SESSION['user_id'] ?? null; 
        
        // 2. Récupération des données POST (JSON)
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        // 3. Validation basique des données
        if (empty($client_id) || !isset($data['prestataire_id'], $data['date_heure'], $data['service'])) {
            http_response_code(400); // Bad Request
            echo json_encode(['status' => 'error', 'message' => 'Données manquantes ou utilisateur non identifié.']);
            return;
        }

        $rdvData = [
            'client_id' => $client_id,
            'prestataire_id' => $data['prestataire_id'],
            'date_heure' => $data['date_heure'],
            'service' => $data['service']
        ];

        // 4. Insertion via le Modèle
        if ($this->rdvModel->createRdv($rdvData)) {
            http_response_code(201); // Created
            echo json_encode(['status' => 'success', 'message' => 'Rendez-vous créé.']);
        } else {
            http_response_code(500); // Internal Server Error
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de l\'enregistrement du rendez-vous.']);
        }
    }
}