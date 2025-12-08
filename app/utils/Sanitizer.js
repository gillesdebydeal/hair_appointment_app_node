// Fichier : app/utils/sanitizer.js

/**
 * Nettoie une chaîne de caractères pour prévenir les attaques XSS et les injections.
 * @param {string} input - La chaîne de caractères à désinfecter.
 * @returns {string} La chaîne de caractères nettoyée ou l'entrée non modifiée.
 */
function sanitize(input) {
    // 1. Vérification du type (Traite uniquement les chaînes)
    if (typeof input !== 'string') {
        return input;
    }

    // 2. Nettoyage de base : Suppression des espaces blancs inutiles.
    let cleaned = input.trim(); 

    // 3. Échappement des caractères dangereux (Sécurité Anti-XSS)
    // Échappe les balises HTML et les guillemets qui pourraient être utilisés pour l'injection.
    cleaned = cleaned.replace(/&/g, '&amp;') 
                    .replace(/</g, '&lt;')    
                    .replace(/>/g, '&gt;')    
                    .replace(/"/g, '&quot;')  
                    .replace(/'/g, '&#x27;'); 
    
    return cleaned;
}

/**
 * Fonction de vérification du format Email (utilisée pour la sécurité Back-End).
 */
function isValidEmail(email) {
    // Expression régulière de base pour valider le format 'user@domaine.com'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


module.exports = {
    sanitize,
    isValidEmail
};