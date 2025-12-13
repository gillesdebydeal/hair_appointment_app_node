<?php
// Fichier : api_php.php

// 1. Headers CORS & JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- 2. CHARGEMENT DES VARIABLES D'ENVIRONNEMENT (.env) ---
function loadEnv($path)
{
    if (!file_exists($path)) {
        // Si pas de .env, on ne fait rien (ou on renvoie une erreur)
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorer les commentaires
        if (strpos(trim($line), '#') === 0) continue;

        // Séparer Nom=Valeur
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Charger dans les variables d'environnement PHP
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Charger le .env situé à la racine (__DIR__)
loadEnv(__DIR__ . '/.env');


// 3. Inclusions des fichiers
require_once __DIR__ . '/app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/app/models/RdvModel.php';
require_once __DIR__ . '/app/controllers/RdvController.php';

// 4. Auth Simulée (Pour le test)
AuthMiddleware::initSession();
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1;
    $_SESSION['role'] = 'client';
}

// 5. CONNEXION DB SÉCURISÉE
try {
    // Récupération des variables depuis le .env
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'hair_appointment';
    $port = getenv('DB_PORT') ?: '3306';
    $user = getenv('DB_USER') ?: 'Gilles';
    $pass = getenv('DB_PASS') ?: '';

    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";

    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // MODIFICATION : On affiche le message réel de MySQL pour déboguer
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Erreur SQL : ' . $e->getMessage()
    ]);
    exit();
}

// 6. Initialisation
$rdvModel = new RdvModel($pdo);
$rdvController = new RdvController($rdvModel);

// 7. Routage
$action = $_GET['action'] ?? 'home';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    // C'EST CE BLOC QUI MANQUAIT OU NE MARCHAIT PAS
    case 'resources':
        $rdvController->getEmployeesApi(); // Méthode qui renvoie Experts + Services + Salons
        break;

    case 'availability':
        $rdvController->checkAvailability();
        break;

    case 'book':
        $rdvController->create();
        break;

    case 'rdv':
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = $_GET['id'] ?? 0;
            $rdvController->delete($id);
        } else {
            $rdvController->index();
        }
        break;

    default:
        // C'est ici que vous tombiez avant
        echo json_encode([
            "status" => "success", 
            "message" => "API Ready. Available actions: resources, availability, book, rdv"
        ]);
        break;
}

?>