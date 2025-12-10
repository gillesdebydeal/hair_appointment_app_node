/* ====================================================================
   Fichier : public/assets/js/script.js
   Objectif : Rétablir l'effet de scroll Navbar + Connexion API
   ==================================================================== */

// URL API (On la garde pour la suite)
const API_URL = 'http://localhost:8080/hair-appointment-app_nodeJs/api_php.php';

// On attend que le HTML soit chargé
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GESTION PRIORITAIRE DU HEADER (SCROLL)
    initNavbarScroll();

    // 2. Menu Mobile
    initMobileMenu();

    // 3. API : Chargement des services (Uniquement si la grille existe)
    if (document.getElementById('services-grid')) {
        loadServicesFromApi();
    }
});


/* ====================================================================
   1. GESTION DU HEADER (VOTRE EFFET RESTAURÉ)
   ==================================================================== */

const mainHeader = document.querySelector('.main-header');

// Définition du seuil de déclenchement (en pixels)
// Le seuil est fixé à 1200px pour la page d'accueil et à 100px pour toutes les autres pages courtes.
const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
const scrollThreshold = isHomePage ? 1200 : 100;

// Vérification de la position de scroll.
function handleScroll() {
    // Vérifie si mainHeader existe avant de manipuler ses classes
    if (mainHeader) { 
        if (window.scrollY > scrollThreshold) { 
            mainHeader.classList.add('scrolled'); 
        } else {    
            mainHeader.classList.remove('scrolled'); 
        }
    }
}

// Rattache la fonction à l'événement de défilement de la fenêtre
window.addEventListener('scroll', handleScroll);


/* ====================================================================
   2. MENU MOBILE
   ==================================================================== */

function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn') || document.querySelector('.navbar-toggler');
    const nav = document.querySelector('.nav-links') || document.querySelector('.navbar-collapse');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            // Gestion compatible Bootstrap ou Custom
            if (nav.classList.contains('collapse')) {
                // Laissez Bootstrap gérer si c'est du bootstrap standard
            } else {
                nav.classList.toggle('active');
            }
        });
    }
}


/* ====================================================================
   3. API PHP (SERVICES DYNAMIQUES)
   ==================================================================== */

async function loadServicesFromApi() {
    try {
        const response = await fetch(`${API_URL}?action=resources`);
        const data = await response.json();

        // Cette fonction ne touche PAS au header, elle remplit juste la grille si elle existe
        // ... code de remplissage ...
        // (Je laisse ce bloc vide ou minimal pour ne pas interférer avec votre test visuel)
        console.log("Services chargés depuis API PHP"); 

    } catch (error) {
        console.error("Erreur API (non bloquant pour le design):", error);
    }
}