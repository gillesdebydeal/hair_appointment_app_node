// Fichier : pages/reservation.js

// ====================================================================
// ÉTAT DE L'APPLICATION
// ====================================================================

// État initial : On commence par la date d'AUJOURD'HUI (et non le lundi)
let currentWeekStart = new Date();
currentWeekStart.setHours(0, 0, 0, 0); // On remet les heures à zéro pour éviter les bugs

const selectedPrestationId = 14;// choix de prestation par défaut    durée 30min c'est la coupe homme  
const businessId = 1;                 
const userRole = 'CLIENT';            
const MAX_WEEKS_IN_FUTURE = 4;        
const WEEKS_TO_LOAD = 4;              
let currentEmployeeId = null;         


// ====================================================================
// UTILS : MANIPULATION DE DATES & SLOTS
// ====================================================================

/**
 * Formate un objet Date en chaîne 'YYYY-MM-DD' pour l'API.
 */
function toApiDateString(d) {
    const year = d.getFullYear();
    // getMonth() commence à 0, donc on ajoute 1. padStart assure le format "01"
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/** --------------ICI on règle l'amplitude maximale des créneaux pour l'affichage du calendrier-------------
 * Génère tous les créneaux affichables (Élargi de 09h00 à 18h00)
 */
function generateAllPossibleSlots() {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
        const hourString = String(hour).padStart(2, '0');
        // CORRECTION : On ne met plus les secondes
        slots.push(`${hourString}:00`);
        slots.push(`${hourString}:30`);
    }
    return slots;
}

/**
 * Met à jour le titre H3 avec la période de la semaine affichée (J à J+6).
 */
function updatePeriodTitle(startDate) {
    const titleElement = document.getElementById('current-period');
    if (!titleElement) return;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // Affiche une plage de 7 jours

    const formatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });
    
    titleElement.textContent = `Du ${formatter.format(startDate)} au ${formatter.format(endDate)}`;
}


// ====================================================================
// LOGIQUE DE NAVIGATION (SLIDER CORRIGÉ)
// ====================================================================

/**
 * Gère la navigation par bond de 7 jours exacts.
 */
function handleWeekNavigation(direction) {
    // Date minimale (Aujourd'hui) - On recrée un objet date propre
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newDate = new Date(currentWeekStart);

    // Calcul de la nouvelle date (+/- 7 jours)
    const daysToAdd = direction === 'next' ? 7 : -7;
    newDate.setDate(newDate.getDate() + daysToAdd);
    
    // NOTE : On a SUPPRIMÉ 'newDate = getMonday(newDate)' ici.
    // C'est ce qui causait le bug du saut d'un jour.

    // Définir la limite maximale (Aujourd'hui + 4 semaines)
    const maxDateAllowed = new Date(today);
    maxDateAllowed.setDate(maxDateAllowed.getDate() + (MAX_WEEKS_IN_FUTURE * 7));

    // 1. GESTION DE LA LIMITE PASSÉ
    // Si on essaie de reculer avant aujourd'hui, on force à aujourd'hui
    if (direction === 'prev' && newDate < today) {
        console.warn("Retour à la date d'aujourd'hui.");
        newDate = today; 
    }
    
    // 2. GESTION DE LA LIMITE FUTUR
    if (direction === 'next' && newDate > maxDateAllowed) {
        console.warn(`Navigation bloquée : Limite de ${MAX_WEEKS_IN_FUTURE} semaines atteinte.`);
        return; 
    }

    // Mise à jour de l'état
    currentWeekStart = newDate;
    
    // Rechargement
    loadCalendarView(toApiDateString(currentWeekStart)); 
}


// ====================================================================
// INTERACTION API
// ====================================================================

async function fetchAvailability(startDate, weeks) {
    const employeeIdParam = currentEmployeeId ? `&employeeId=${currentEmployeeId}` : '';
    const url = `/api/calendar/availability?businessId=${businessId}&startDate=${startDate}&weeks=${weeks}&prestaId=${selectedPrestationId}&role=${userRole}${employeeIdParam}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.availability; 
    } catch (error) {
        console.error("Échec API:", error);
        document.getElementById('calendar-grid').innerHTML = 
            `<p class="error">Impossible de charger les disponibilités.</p>`;
        return null;
    }
}

// NOUVEAU : Récupère les employés
async function loadEmployees(businessId) {
    try {
        const response = await fetch(`/api/business/employees?businessId=${businessId}`);
        const data = await response.json();

        if (response.ok) {
            const selectElement = document.getElementById('employee-select');
            if (!selectElement) return;

            selectElement.innerHTML = '<option value="null">Peu importe l\'expert</option>'; 
            
            data.employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id; 
                // Affichage sans la spécialité pour le client
                option.textContent = `${employee.prenom} ${employee.nom.charAt(0)}.`;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Erreur employés:", error);
    }
}


// ====================================================================
// RENDU DE L'INTERFACE UTILISATEUR
// ====================================================================

function renderCalendar(availabilityData) {
    const calendarContainer = document.getElementById('calendar-grid');
    if (!calendarContainer) return;

    calendarContainer.innerHTML = ''; 

    // Récupère les slots au format court "08:00", "08:30"...
    const allSlots = generateAllPossibleSlots(); 
    
    const weekElement = document.createElement('div');
    weekElement.className = 'calendar-week'; 
    calendarContainer.appendChild(weekElement);

    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(currentWeekStart);
        currentDate.setDate(currentDate.getDate() + i);
        const dateString = toApiDateString(currentDate); 
        
        // availabilityData[dateString] est un tableau d'OBJETS venant du backend
        const daySlotsFromApi = availabilityData[dateString] || [];
        const isSunday = currentDate.getDay() === 0;

        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        // Logique visuelle de fermeture (si aucun slot renvoyé par l'API)
        let isDayUnavailable = false;
        if ((isSunday && daySlotsFromApi.length === 0) || 
            (!isSunday && daySlotsFromApi.length === 0 && allSlots.length > 0)) {
            isDayUnavailable = true;
        }
        
        if (isDayUnavailable) dayElement.classList.add('day-unavailable');

        dayElement.innerHTML = `
            <div class="day-header">
                <span class="day-name">${currentDate.toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
                <span class="day-number">${currentDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            </div>
        `;
        
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'slots-list';
        
        // Génération des boutons
        allSlots.forEach(slotTime => {
            // CORRECTION CRITIQUE ICI :
            // On cherche si l'heure "09:00" existe dans la propriété .start des objets de l'API
            const isAvailable = daySlotsFromApi.some(s => s.start === slotTime);
            
            const slotButton = document.createElement('button');
            slotButton.textContent = slotTime; // Affiche "09:00"
            slotButton.className = 'slot-button';
            
            if (isAvailable) {
                slotButton.classList.add('available-slot');
                // On garde l'événement de clic
                slotButton.onclick = () => selectSlot(dateString, slotTime); 
            } else {
                slotButton.classList.add('unavailable-slot');
                slotButton.disabled = true;
            }
            
            slotsContainer.appendChild(slotButton);
        });
        
        dayElement.appendChild(slotsContainer);
        weekElement.appendChild(dayElement);
    }
}

// Simulation de la fonction selectSlot (car elle est appelée dans le onclick)
async function selectSlot(dateString, timeString) {
    if (!confirm(`Réserver le ${dateString} à ${timeString} ?`)) return;
    
    const dateTimeStart = `${dateString} ${timeString}:00`;
    const bookingData = {
        businessId: businessId,
        prestationId: selectedPrestationId,
        employeeId: currentEmployeeId,
        dateStart: dateTimeStart,
        clientId: 2 // ID Client simulé
    };

    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const result = await response.json();
        if (response.ok) {
            alert("Réservation confirmée !");
            loadCalendarView(toApiDateString(currentWeekStart)); // Rafraîchir
        } else {
            alert("Erreur : " + result.message);
        }
    } catch (e) {
        console.error(e);
        alert("Erreur technique");
    }
}


// ====================================================================
// INITIALISATION
// ====================================================================

async function loadCalendarView(startDateString, weeks = WEEKS_TO_LOAD) {
    const availabilityData = await fetchAvailability(startDateString, weeks);
    
    if (availabilityData) {
        updatePeriodTitle(currentWeekStart); 
        renderCalendar(availabilityData);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees(businessId);
    
    const employeeSelect = document.getElementById('employee-select');
    if (employeeSelect) {
        employeeSelect.onchange = (event) => {
            currentEmployeeId = event.target.value === 'null' ? null : parseInt(event.target.value);
            loadCalendarView(toApiDateString(currentWeekStart));
        };
    }

    const prevButton = document.getElementById('prev-week');
    const nextButton = document.getElementById('next-week');
    
    if (prevButton) prevButton.onclick = () => handleWeekNavigation('prev');
    if (nextButton) nextButton.onclick = () => handleWeekNavigation('next');
    
    // Initialisation directe sur "Aujourd'hui"
    currentWeekStart = new Date(); 
    currentWeekStart.setHours(0,0,0,0);
    
    loadCalendarView(toApiDateString(currentWeekStart));
});