// Fichier : public/js/reservation.js

const API_BASE = 'http://localhost:8080/hair-appointment-app_nodeJs/api_php.php';

// --- ÉTAT GLOBAL ---
let currentWeekStart = new Date();
currentWeekStart.setHours(0, 0, 0, 0);

// Valeurs par défaut
let currentBusinessId = 1;  
let currentPrestationId = 14; // Valeur par défaut (ex: Coupe Homme)
let currentEmployeeId = null;

// --- DÉMARRAGE ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. D'abord, on charge les listes (Services & Experts)
    await loadResources(); 
    
    // 2. Ensuite, on vérifie si l'URL contient une pré-sélection (Venant de la page Prestations)
    checkUrlParams();

    // 3. Enfin, on charge les données perso et le calendrier
    loadMyRdvs();    
    loadCalendarView(toApiDate(currentWeekStart));

    // Listeners
    document.getElementById('prev-week').onclick = () => navWeek(-7);
    document.getElementById('next-week').onclick = () => navWeek(7);
    setupDropdownListeners();
});

// --- LOGIQUE DE PRÉ-SÉLECTION (Le lien entre les pages) ---
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('prestaId'); // On cherche ?prestaId=X

    if (paramId) {
        currentPrestationId = parseInt(paramId);
        
        // On met à jour le menu déroulant visuellement
        const select = document.getElementById('service-select');
        if (select) {
            select.value = currentPrestationId;
        }
        console.log("Prestation pré-sélectionnée via URL :", currentPrestationId);
    }
}

function setupDropdownListeners() {
    // Si on change de service manuellement
    const srvSelect = document.getElementById('service-select');
    if (srvSelect) {
        srvSelect.onchange = (e) => {
            currentPrestationId = e.target.value;
            loadCalendarView(toApiDate(currentWeekStart));
        };
    }

    // Si on change d'expert
    const empSelect = document.getElementById('employee-select');
    if (empSelect) {
        empSelect.onchange = (e) => {
            currentEmployeeId = e.target.value === 'null' ? null : e.target.value;
            loadCalendarView(toApiDate(currentWeekStart));
        };
    }
}

// --- API : CHARGEMENT DES RESSOURCES ---
async function loadResources() {
    try {
        // On appelle l'action 'resources' qui renvoie TOUT (experts + services)
        const res = await fetch(`${API_BASE}?action=resources&businessId=${currentBusinessId}`);
        const data = await res.json();
        
        // 1. Remplir le menu SERVICES
        const srvSel = document.getElementById('service-select');
        if (srvSel && data.services) {
            srvSel.innerHTML = ''; // On vide
            data.services.forEach(s => {
                // On ajoute chaque service de la DB
                srvSel.innerHTML += `<option value="${s.id_prestation}">${s.nom} (${s.tarif_forfait}€)</option>`;
            });
            // Si aucune pré-sélection URL n'est faite plus tard, on prend la valeur actuelle du select
            if (!currentPrestationId && srvSel.value) {
                currentPrestationId = srvSel.value;
            }
        }

        // 2. Remplir le menu EXPERTS
        const empSel = document.getElementById('employee-select');
        if (empSel && data.experts) {
            empSel.innerHTML = '<option value="null">Peu importe l\'expert</option>';
            data.experts.forEach(e => {
                empSel.innerHTML += `<option value="${e.id}">${e.prenom} ${e.nom}</option>`;
            });
        }

    } catch (e) {
        console.error("Erreur chargement ressources:", e);
    }
}

// --- API : CALENDRIER ---
async function fetchAvailability(startDate) {
    const empParam = currentEmployeeId ? `&employeeId=${currentEmployeeId}` : '';
    // On envoie bien l'ID du service pour que le PHP calcule la durée
    const url = `${API_BASE}?action=availability&businessId=${currentBusinessId}&startDate=${startDate}&prestaId=${currentPrestationId}${empParam}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.availability || {}; 
    } catch (e) { return {}; }
}

// --- RENDU GRAPHIQUE ---
async function loadCalendarView(startStr) {
    const data = await fetchAvailability(startStr);
    updatePeriodTitle(currentWeekStart);
    renderCalendar(data);
}

function renderCalendar(availabilityData) {
    const container = document.getElementById('calendar-grid');
    if (!container) return;
    container.innerHTML = ''; 

    const data = availabilityData || {};
    const weekDiv = document.createElement('div');
    weekDiv.className = 'calendar-week';
    container.appendChild(weekDiv);

    const allSlots = generateAllPossibleSlots();

    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        const dateStr = toApiDate(d);
        const daySlots = data[dateStr] || [];
        const isSun = d.getDay() === 0; 
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        if (isSun) dayDiv.classList.add('day-unavailable');

        dayDiv.innerHTML = `<div class="day-header">
            <strong>${d.toLocaleDateString('fr-FR', {weekday:'short'})}</strong><br>
            ${d.getDate()}
        </div>`;

        const slotsList = document.createElement('div');
        slotsList.className = 'slots-list';

        if (!isSun) {
            allSlots.forEach(slotTime => {
                const isAvailable = daySlots.some(s => s.start === slotTime);
                const btn = document.createElement('button');
                btn.textContent = slotTime;
                
                if (isAvailable) {
                    btn.className = 'slot-button available-slot';
                    btn.onclick = () => selectSlot(dateStr, slotTime);
                } else {
                    btn.className = 'slot-button unavailable-slot';
                    btn.disabled = true;
                }
                slotsList.appendChild(btn);
            });
        } else {
             slotsList.innerHTML = '<div style="padding:10px;text-align:center;">Fermé</div>';
        }
        dayDiv.appendChild(slotsList);
        weekDiv.appendChild(dayDiv);
    }
}

// --- UTILS ---
function generateAllPossibleSlots() {
    const slots = [];
    for (let h = 9; h < 19; h++) {
        const hs = String(h).padStart(2, '0');
        slots.push(`${hs}:00`);
        slots.push(`${hs}:30`);
    }
    return slots;
}

function toApiDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
}

function navWeek(days) {
    currentWeekStart.setDate(currentWeekStart.getDate() + days);
    const today = new Date(); today.setHours(0,0,0,0);
    if (currentWeekStart < today && days < 0) currentWeekStart = today;
    loadCalendarView(toApiDate(currentWeekStart));
}

function updatePeriodTitle(date) {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    const t = document.getElementById('current-period');
    if (t) t.textContent = `Du ${date.toLocaleDateString('fr-FR')} au ${end.toLocaleDateString('fr-FR')}`;
}

// --- RÉSERVATION & MES RDV ---
async function selectSlot(date, time) {
    if(!confirm(`Réserver le ${date} à ${time} ?`)) return;

    const payload = {
        businessId: currentBusinessId,
        prestationId: currentPrestationId,
        employeeId: currentEmployeeId,
        dateStart: `${date} ${time}:00`
    };

    try {
        const res = await fetch(`${API_BASE}?action=book`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        
        if (json.status === 'success') {
            alert('Réservation confirmée !');
            loadCalendarView(toApiDate(currentWeekStart));
            loadMyRdvs();
        } else {
            alert('Erreur : ' + json.message);
        }
    } catch (e) { alert("Erreur technique"); }
}

async function loadMyRdvs() {
    try {
        const res = await fetch(`${API_BASE}?action=rdv`);
        const json = await res.json();
        const list = document.querySelector('.appointments-list');
        if (list && json.data) {
            list.innerHTML = '';
            json.data.forEach(r => {
                list.innerHTML += `<div class="appointment-card">
                    <strong>${new Date(r.date_reservation).toLocaleString()}</strong><br>
                    ${r.prestation_nom} - ${r.pro_prenom || 'Expert'}
                    <button onclick="cancelRdv(${r.id_reservation})" style="float:right;color:red;cursor:pointer;">Annuler</button>
                </div>`;
            });
        }
    } catch(e) {}
}

window.cancelRdv = async (id) => {
    if(!confirm('Annuler ?')) return;
    await fetch(`${API_BASE}?action=rdv&id=${id}`, { method: 'DELETE' });
    loadMyRdvs();
    loadCalendarView(toApiDate(currentWeekStart));
};