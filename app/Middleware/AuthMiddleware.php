<?php
// Middleware/AuthMiddleware.php

class AuthMiddleware {

    // Démarre la session si ce n'est pas déjà fait
    public static function initSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * Vérifie si l'utilisateur est connecté.
     * Si non, retourne une erreur 401 (Non autorisé) et arrête le script.
     */
    public static function isAuthenticated() {
        self::initSession();

        if (!isset($_SESSION['user_id']) || empty($_SESSION['user_id'])) {
            self::sendJsonError("Accès refusé. Vous devez être connecté.", 401);
        }
    }

    /**
     * Vérifie si l'utilisateur a le rôle requis.
     * @param string $requiredRole 'admin', 'prestataire', ou 'client'
     */
    public static function hasRole($requiredRole) {
        self::isAuthenticated(); // On vérifie d'abord qu'il est connecté

        // Supposons que le rôle est stocké en session lors du login
        if (!isset($_SESSION['role']) || $_SESSION['role'] !== $requiredRole) {
            self::sendJsonError("Accès interdit. Rôle '{$requiredRole}' requis.", 403);
        }
    }

    /**
     * Helper pour renvoyer une réponse JSON d'erreur et arrêter l'exécution.
     */
    private static function sendJsonError($message, $code) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => $message]);
        exit(); // Arrêt immédiat du script (protection critique)
    }
}
?>