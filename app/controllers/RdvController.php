<?php
// Fichier : app/controllers/RdvController.php

class RdvController {
    private $rdvModel;

    public function __construct(RdvModel $rdvModel) {
        $this->rdvModel = $rdvModel;
    }

    /**
     * C'EST CETTE MÉTHODE QUI MANQUAIT
     * Elle récupère les experts et les services pour les menus déroulants
     */
    public function getEmployeesApi() {
        $businessId = 1; // ID Salon par défaut (Villefranche)
        
        // 1. Les Experts (Coiffeurs)
        $experts = $this->rdvModel->getExperts($businessId);
        
        // 2. Les Services (Prestations) - Indispensable pour calculer la durée
        $services = $this->rdvModel->getServices($businessId);
        
        // On renvoie tout en JSON
        echo json_encode([
            'status' => 'success',
            'experts' => $experts,
            'services' => $services
        ]);
    }

    /**
     * Vérifie les disponibilités pour le calendrier
     */
    public function checkAvailability() {
        $businessId = 1;
        $startDateStr = $_GET['startDate'] ?? date('Y-m-d');
        
        // On récupère l'ID prestation (14 = Coupe Homme par défaut)
        $prestationId = $_GET['prestaId'] ?? 14; 
        
        // On gère le cas "Peu importe" (null) ou un ID spécifique
        $employeeId = (!empty($_GET['employeeId']) && $_GET['employeeId'] !== 'null') ? (int)$_GET['employeeId'] : null;

        // On calcule la durée réelle de la prestation choisie
        $duration = $this->rdvModel->getPrestationDuration((int)$prestationId);
        if ($duration <= 0) $duration = 30; // Sécurité

        $availability = [];
        $start = new DateTime($startDateStr);

        // Boucle sur 7 jours
        for ($i = 0; $i < 7; $i++) {
            $currentDate = $start->format('Y-m-d');
            $daySlots = [];

            // Créneaux de 09h à 19h
            for ($h = 9; $h < 19; $h++) {
                foreach (['00', '30'] as $min) {
                    $datetimeStr = "$currentDate $h:$min:00";
                    
                    // Appel au Modèle pour vérifier la dispo
                    $availableProId = $this->rdvModel->checkSlotAvailability(
                        $businessId, $datetimeStr, $duration, $employeeId
                    );

                    if ($availableProId) {
                        $daySlots[] = [
                            'start' => "$h:$min",
                            'status' => 'available'
                        ];
                    }
                }
            }
            $availability[$currentDate] = $daySlots;
            $start->modify('+1 day');
        }

        echo json_encode(['availability' => $availability]);
    }

    /**
     * Enregistre le rendez-vous
     */
    public function create() {
        $client_id = $_SESSION['user_id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        $businessId = $data['businessId'] ?? 1;
        $prestationId = $data['prestationId'] ?? 14;
        $employeeId = $data['employeeId'] ?? null;
        $dateStart = $data['dateStart'] ?? null;

        if (!$dateStart) {
            echo json_encode(['status' => 'error', 'message' => 'Date manquante']);
            return;
        }

        // Vérification ultime avant insertion
        $duration = $this->rdvModel->getPrestationDuration($prestationId);
        $assignedPro = $this->rdvModel->checkSlotAvailability($businessId, $dateStart, $duration, $employeeId);

        if (!$assignedPro) {
            http_response_code(409);
            echo json_encode(['status' => 'error', 'message' => 'Créneau indisponible']);
            return;
        }

        $rdvData = [
            'client_id'      => $client_id,
            'business_id'    => $businessId,
            'prestataire_id' => $assignedPro,
            'prestation_id'  => $prestationId,
            'date_reservation' => $dateStart
        ];

        $res = $this->rdvModel->createRdv($rdvData);

        if ($res['success']) {
            echo json_encode(['status' => 'success', 'message' => 'RDV Confirmé']);
        } else {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => $res['error']]);
        }
    }

    public function index() {
        echo json_encode(['status' => 'success', 'data' => $this->rdvModel->getAllRdvs($_SESSION['user_id'])]);
    }
    
    public function delete($id) {
        $this->rdvModel->deleteRdv($id, $_SESSION['user_id']);
        echo json_encode(['status' => 'success']);
    }
}
?>