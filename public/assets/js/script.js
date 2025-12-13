/* ====================================================================
   Fichier : public/assets/js/script.js
   Version : PROD (Navigation + API PHP)
   ==================================================================== */

const API_URL = 'http://localhost:8080/hair-appointment-app_nodeJs/api_php.php';

// Tout le code est encapsulé pour attendre le chargement du HTML
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Lancer la gestion du Header (Scroll)
    // C'est ici que l'erreur se produisait : maintenant la fonction existe bien plus bas.
    initNavbarScroll();

    // 2. Lancer le Menu Mobile
    initMobileMenu();

    // 3. Lancer les formulaires (Recherche, Contact...)
    initForms();

    // 4. Si on est sur la page de Réservation (calendrier), lancer la logique API
    // (Cette partie sera gérée par reservation.js si vous l'avez séparé, sinon laissez tel quel)
});


/* ====================================================================
   1. GESTION DU HEADER (UNIVERSELLE)
   ==================================================================== */

function initNavbarScroll() {
    // On cherche l'élément Header (.main-header ou .navbar)
    const header = document.querySelector('.main-header') || document.querySelector('.navbar');

    if (!header) {
        console.warn("Navbar introuvable (pas de .main-header ni .navbar)");
        return; 
    }

    // Détection de la page d'accueil
    const path = window.location.pathname;
    // On considère accueil si : racine, index.html ou chemin vide
    const isHomePage = path === '/' || path.endsWith('/index.html') || (path.endsWith('/') && path.length < 2);

    // SEUIL DE SCROLL :
    // Accueil = 1200px (Grand scroll)
    // Autres pages = 100px (Scroll rapide)
    const scrollThreshold = isHomePage ? 1200 : 100;

    console.log(`Page: ${isHomePage ? 'Accueil' : 'Autre'}. Seuil scroll: ${scrollThreshold}px`);

    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    // Écouteur
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Vérif immédiate au chargement
}


/* ====================================================================
   2. MENU MOBILE
   ==================================================================== */

function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn') || document.querySelector('.navbar-toggler');
    const nav = document.querySelector('.nav-links') || document.querySelector('.navbar-collapse');

    if (btn && nav) {
        btn.addEventListener('click', () => {
            // Si c'est un bouton Bootstrap standard, il gère lui-même le toggle via data-bs-toggle.
            // Sinon, on force la classe active.
            if (!btn.hasAttribute('data-bs-toggle')) {
                nav.classList.toggle('active');
            }
        });
    }
}


/* ====================================================================
   3. GESTION DES FORMULAIRES (Recherche, Contact)
   ==================================================================== */

function initForms() {
    // RECHERCHE
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = document.getElementById('search-presta')?.value || '';
            const l = document.getElementById('search-location')?.value || '';
            // Redirection vers la réservation
            window.location.href = `/reservation?search=${encodeURIComponent(p)}&loc=${encodeURIComponent(l)}`;
        });
    }

    // CONTACT
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Message envoyé !");
            contactForm.reset();
        });
    }
}