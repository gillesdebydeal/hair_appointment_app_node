<?php
// api_php.php (Routeur principal PHP pour les API)

// 1. Chargement des dépendances
// Les chemins sont ajustés pour atteindre les fichiers dans le sous-dossier 'app/'
require_once 'app/Middleware/AuthMiddleware.php';
require_once 'app/models/RdvModel.php';
require_once 'app/controllers/RdvController.php';

// --- 2. CONNEXION À LA BASE DE DONNÉES (À ADAPTER) ---
try {
    // !! Remplacer 'user' et 'pass' par vos identifiants réels de base de données !!
    $pdo = new PDO('mysql:host=localhost;dbname=rdv_db;charset=utf8', 'user', 'pass');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Pour les erreurs de SQL, une exception sera lancée.
} catch (PDOException $e) {
    // Arrêt immédiat si la connexion échoue
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Erreur de connexion à la base de données.']);
    exit();
}
// --------------------------------------------------------


// 3. Récupération des paramètres de routage
$action = $_GET['action'] ?? 'home';
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null; // Pour les opérations PUT/DELETE sur une ressource spécifique

// 4. Initialisation des composants
$rdvModel = new RdvModel($pdo);
$rdvController = new RdvController($rdvModel);


switch ($action) {
    
    // --- ROUTES PUBLIQUES ---
    case 'login':
        // Gère la connexion et enregistre 'user_id' et 'role' dans la session
        // AuthController::login();
        break;

    // --- ROUTE GESTION DES RDV (Tâches 1, 2, et 3 intégrées) ---
    case 'rdv':
        
        // SÉCURITÉ (Tâche 3) : L'accès à ce point d'API nécessite d'être connecté
        AuthMiddleware::isAuthenticated(); 

        if ($method === 'POST') {
            // Tâche 1 : Création d'un nouveau RDV
            // Endpoint : POST /api_php.php?action=rdv
            $rdvController->create();
            
        } elseif ($method === 'PUT') {
            // Tâche 2 : Modification d'un RDV existant
            // Endpoint : PUT /api_php.php?action=rdv&id=123
            if (!$id) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID de rendez-vous manquant (PUT).']);
                break;
            }
            $rdvController->update((int)$id);

        } elseif ($method === 'DELETE') {
            // Tâche 2 : Suppression/Annulation d'un RDV
            // Endpoint : DELETE /api_php.php?action=rdv&id=123
            if (!$id) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'ID de rendez-vous manquant (DELETE).']);
                break;
            }
            $rdvController->delete((int)$id);
            
        } else {
            // Méthode non supportée
            http_response_code(405);
            echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée pour cette ressource.']);
        }
        break;


    // --- ROUTES ADMIN (Tâche 3 ciblée) ---
    case 'admin_dashboard':
    case 'delete_user':
        // SÉCURITÉ (Tâche 3) : Seul l'administrateur peut accéder
        AuthMiddleware::hasRole('administrateur');
        
        // Si on passe ici, l'utilisateur est bien admin
        // AdminController::dashboard();
        echo json_encode(["message" => "Bienvenue dans l'espace Admin"]);
        break;

    default:
        // 404 Not Found
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Ressource non trouvée."]);
        break;
}
?>