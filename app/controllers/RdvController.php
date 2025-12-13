<?php
// Fichier : app/controllers/RdvController.php

class RdvController {
    private $rdvModel;

    public function __construct(RdvModel $rdvModel) {
        $this->rdvModel = $rdvModel;
    }

    // --- CETTE FONCTION EST VITALE POUR VOTRE PAGE DE RÉSERVATION ---
    public function getEmployeesApi() {
        // ID du salon par défaut
        $businessId = 1; 
        
        // On récupère les experts
        $experts = $this->rdvModel->getExperts($businessId);
        
        // On récupère les services
        // (Assurez-vous que RdvModel::getServices existe et fonctionne)
        $services = $this->rdvModel->getServices($businessId);
        
        // On renvoie le JSON
        // On force le header JSON ici pour être sûr
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'experts' => $experts,
            'services' => $services
        ]);
        exit(); // On arrête le script ici pour éviter tout autre affichage
    }
    // ---------------------------------------------------------------

    public function checkAvailability() {
        $businessId = 1;
        $startDateStr = $_GET['startDate'] ?? date('Y-m-d');
        $prestationId = $_GET['prestaId'] ?? 14; 
        
        $employeeId = (!empty($_GET['employeeId']) && $_GET['employeeId'] !== 'null') 
            ? (int)$_GET['employeeId'] 
            : null;

        // Récupération durée (avec valeur par défaut 30min si erreur)
        $duration = 30;
        try {
            $duration = $this->rdvModel->getPrestationDuration((int)$prestationId);
        } catch (Exception $e) { $duration = 30; }
        
        if ($duration <= 0) $duration = 30; 

        $availability = [];
        $start = new DateTime($startDateStr);

        for ($i = 0; $i < 7; $i++) {
            $currentDate = $start->format('Y-m-d');
            $daySlots = [];

            for ($h = 9; $h < 19; $h++) {
                foreach (['00', '30'] as $min) {
                    $datetimeStr = "$currentDate $h:$min:00";
                    
                    $availableProId = $this->rdvModel->checkSlotAvailability(
                        $businessId, $datetimeStr, $duration, $employeeId
                    );

                    if ($availableProId) {
                        $daySlots[] = ['start' => "$h:$min", 'status' => 'available'];
                    }
                }
            }
            $availability[$currentDate] = $daySlots;
            $start->modify('+1 day');
        }

        header('Content-Type: application/json');
        echo json_encode(['availability' => $availability]);
        exit();
    }

    public function create() {
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents('php://input'), true);

        $businessId = $data['businessId'] ?? 1;
        $prestationId = $data['prestationId'] ?? 14;
        $employeeId = $data['employeeId'] ?? null;
        $dateStart = $data['dateStart'] ?? null;
        $client_id = 1; // ID client temporaire

        if (!$dateStart) {
            echo json_encode(['status' => 'error', 'message' => 'Date manquante']);
            exit();
        }

        $duration = 30; 
        try { $duration = $this->rdvModel->getPrestationDuration($prestationId); } catch(Exception $e){}

        $assignedPro = $this->rdvModel->checkSlotAvailability($businessId, $dateStart, $duration, $employeeId);

        if (!$assignedPro) {
            echo json_encode(['status' => 'error', 'message' => 'Créneau indisponible']);
            exit();
        }

        $rdvData = [
            'client_id'      => $client_id,
            'business_id'    => $businessId,
            'prestataire_id' => $assignedPro,
            'prestation_id'  => $prestationId,
            'date_reservation' => $dateStart
        ];

        $res = $this->rdvModel->createRdv($rdvData);

        if ($res['success']) echo json_encode(['status' => 'success', 'message' => 'RDV Confirmé']);
        else echo json_encode(['status' => 'error', 'message' => $res['error']]);
        exit();
    }

    public function index() {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'data' => []]);
        exit();
    }
    
    public function delete($id) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success']);
        exit();
    }
}
?>