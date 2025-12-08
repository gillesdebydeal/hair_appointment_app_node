// Fichier : public/assets/js/script.js

// ====================================================================
// 1. GESTION DU HEADER (Interaction JS/CSS lors du défilement)
// ====================================================================

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

// ====================================================================
// 2. LOGIQUE GLOBALE DE VALIDATION (Utilitaires)
// ====================================================================

// Expression régulière standard pour le format Email.
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

// Expression régulière pour le mot de passe : 8 caractères, 1 Majuscule, 1 minuscule, 1 chiffre.
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; 


// Vérification simple : vérifie si un champ est vide
function validateField(field) {
    if (field.value.trim() === '') {
        field.classList.add('is-invalid');
        // Mise à jour de l'élément d'erreur associé si présent (ex: le nextElementSibling)
        if (field.nextElementSibling) {
            field.nextElementSibling.textContent = "Ce champ est obligatoire.";
        }
        return false;
    } else {
        field.classList.remove('is-invalid');
        // Effacer le message d'erreur précédent
        if (field.nextElementSibling) {
            field.nextElementSibling.textContent = "";
        }
        return true;
    }
}

function validateEmail(field) {
    const email = field.value.trim();
    if (!emailRegex.test(email)) {
        field.classList.add('is-invalid');
        if (field.nextElementSibling) {
            field.nextElementSibling.textContent = "Veuillez entrer une adresse e-mail valide.";
        }
        return false;
    }
    field.classList.remove('is-invalid');
    if (field.nextElementSibling) {
        field.nextElementSibling.textContent = "";
    }
    return true;
}

function validatePassword(passwordField) {
    const password = passwordField.value.trim();
    if (password === '') {
        // ... (Gestion de l'erreur vide)
        return false;
    }
    if (!passwordRegex.test(password)) {
        // ... (Gestion de l'erreur format)
        return false;
    }
    passwordField.classList.remove('is-invalid');
    if (passwordField.nextElementSibling) {
        passwordField.nextElementSibling.textContent = "";
    }
    return true;
}


// ====================================================================
// 3. RECHERCHE (Page d'accueil)
// ====================================================================

const searchForm = document.getElementById('search-form');
const searchPresta = document.getElementById('search-presta');
const searchLocation = document.getElementById('search-location');

function handleSearchClick(event) {
    event.preventDefault(); 
    // Utiliser validateField et validateLocation ici (si nécessaire)
    const isPrestaValid = searchPresta ? validateField(searchPresta) : true; 
    const isLocationValid = searchLocation ? validateField(searchLocation) : true; 

    if (!isPrestaValid || !isLocationValid) {
        return; 
    }
    
    // Logique de redirection/AJAX vers le calendrier de réservation
    console.log("Validation réussie. Prêt à envoyer la requête AJAX.");
    window.location.href = '/pages/reservation.html?presta=' + searchPresta.value + '&location=' + searchLocation.value;
}

// ATTENTION: Rattachement conditionnel (Correction pour ne pas planter sur d'autres pages)
if (searchForm) {
    searchForm.addEventListener('submit', handleSearchClick);
}


// ====================================================================
// 4. INSCRIPTION (register-form)
// ====================================================================

const registerForm = document.getElementById('register-form');
const registerPrenom = document.getElementById('registerPrenom');
const registerNom = document.getElementById('registerNom');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const cguAccept = document.getElementById('cguAccept');


function handleRegisterSubmit(event) {
    event.preventDefault(); 
    let isValid = true; 

    // Les validations de champs vont ici... (Logique existante)
    if (registerPrenom && !validateField(registerPrenom)) isValid = false;
    if (registerNom && !validateField(registerNom)) isValid = false;
    if (registerEmail && !validateEmail(registerEmail)) isValid = false;
    if (registerPassword && !validatePassword(registerPassword)) isValid = false;
    
    // On check la correspondance des deux mots de passe
    if (registerPassword && registerConfirmPassword && registerPassword.value !== registerConfirmPassword.value) {
        registerConfirmPassword.nextElementSibling.textContent = "Les mots de passe ne correspondent pas.";
        registerConfirmPassword.classList.add('is-invalid');
        isValid = false;
    } else if (registerConfirmPassword) {
        registerConfirmPassword.classList.remove('is-invalid');
        registerConfirmPassword.nextElementSibling.textContent = "";
    }
    
    // On vérifie que la case des CGU est cochée
    if (cguAccept && !cguAccept.checked) {
        alert("Vous devez accepter les Conditions d'Utilisation.");
        isValid = false;
    }

    if (isValid) {
        console.log("Validation Inscription Front-End réussie. Prêt pour l'AJAX.");
        // FUTURE: Requête AJAX vers /api/auth/register
        // window.location.href = '/connexion';
    }
}

// ATTENTION: Rattachement conditionnel
if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
}


// ====================================================================
// 5. CONTACT (contact-form)
// ====================================================================

const contactForm = document.getElementById('contact-form');
const contactNom = document.getElementById('contactNom');
const contactEmail = document.getElementById('contactEmail');
const contactSubject = document.getElementById('contactSubject');
const contactMessage = document.getElementById('contactMessage');

function handleContactSubmit(event) {
    event.preventDefault(); 
    let isValid = true; 

    // Les validations de champs vont ici... (Logique existante)
    if (contactNom && !validateField(contactNom)) isValid = false;
    if (contactSubject && !validateField(contactSubject)) isValid = false;
    if (contactMessage && !validateField(contactMessage)) isValid = false;
    if (contactEmail && !validateEmail(contactEmail)) isValid = false;

    if (isValid) {
        console.log("Formulaire de Contact validé. Prêt pour l'envoi AJAX.");
        // FUTURE: Requête AJAX pour l'envoi du message
        if (contactForm) contactForm.reset(); 
        alert("Votre message a été envoyé avec succès.");
    }
}

// ATTENTION: Rattachement conditionnel
if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
}


// ====================================================================
// 6. CONNEXION (login-form) - (Requête AJAX vers /api/auth/login)
// ====================================================================

const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');


async function handleLoginSubmit(event) {
    event.preventDefault(); 
    
    // Assurez-vous que l'email et le password sont définis avant d'accéder à .value
    const email = loginEmail ? loginEmail.value.trim() : '';
    const password = loginPassword ? loginPassword.value : '';
    
    // ... (Logique AJAX existante) ...
    try {
        const response = await fetch('/api/auth/login', { /* ... */ });
        const data = await response.json(); 

        if (response.ok) { 
            console.log("Authentification réussie. Rôle :", data.role);
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('userRole', data.role);
            updateAuthStatusUI(data.role); 
            window.location.href = data.role === 'CLIENT' ? '/pages/client-dashboard.html' : '/pages/admin-dashboard.html';
        } else {
            alert("Erreur de connexion : " + data.message); 
        }
    } catch (error) {
        console.error("Erreur Fetch lors de la connexion:", error);
        alert("Impossible de communiquer avec le serveur.");
    }
}

// ATTENTION: Rattachement conditionnel (Ceci corrige l'erreur Uncaught TypeError)
if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
}


// Fonction pour mettre à jour l'état du bouton
function updateAuthStatusUI(role) {
    const connexionBtn = document.querySelector('a[href*="connexion.html"]');
    if (connexionBtn) {
        connexionBtn.textContent = 'Mon Compte';
        connexionBtn.href = '/pages/dashboard.html';
        // FUTURE : Logique pour masquer le bouton Inscription
    }
}