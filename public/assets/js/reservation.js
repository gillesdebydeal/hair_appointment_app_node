const API_BASE = 'http://localhost:8080/hair-appointment-app_nodeJs/api_php.php';

let currentWeekStart = new Date();
currentWeekStart.setHours(0, 0, 0, 0);

let currentBusinessId = 1;  
let currentPrestationId = 14; 
let currentEmployeeId = null;
let allServices = []; 

document.addEventListener('DOMContentLoaded', async () => {
    console.log("1. Démarrage de la page Réservation");

    // 1. On attend IMPÉRATIVEMENT que les ressources soient chargées
    await loadResources(); 
    
    // 2. Maintenant que allServices est rempli, on vérifie l'URL
    console.log("3. Vérification de l'URL...");
    checkUrlParams();

    // 3. Suite du chargement
    loadMyRdvs();    
    loadCalendarView(toApiDate(currentWeekStart));

    // Listeners
    document.getElementById('prev-week').onclick = () => navWeek(-7);
    document.getElementById('next-week').onclick = () => navWeek(7);
    setupDropdownListeners();
});

// --- API RESOURCES ---
async function loadResources() {
    try {
        console.log("2. Appel API PHP en cours...");
        const res = await fetch(`${API_BASE}?action=resources&businessId=${currentBusinessId}`);
        const data = await res.json();
        
        console.log("   -> Données reçues du PHP :", data); // REGARDEZ CETTE LIGNE DANS LA CONSOLE (F12)

        if (data.services) {
            allServices = data.services;
            console.log("   -> Services stockés :", allServices.length);
        }

        // Remplissage Select Services
        const srvSel = document.getElementById('service-select');
        if (srvSel && data.services) {
            srvSel.innerHTML = '';
            data.services.forEach(s => {
                srvSel.innerHTML += `<option value="${s.id_prestation}">${s.nom} (${s.tarif_forfait}€)</option>`;
            });
            // Sélection par défaut
            if (!currentPrestationId && srvSel.value) currentPrestationId = srvSel.value;
        }

        // Remplissage Select Experts
        const empSel = document.getElementById('employee-select');
        if (empSel && data.experts) {
            empSel.innerHTML = '<option value="null">Peu importe</option>';
            data.experts.forEach(e => {
                empSel.innerHTML += `<option value="${e.id}">${e.prenom} ${e.nom}</option>`;
            });
        }

    } catch (e) { console.error("ERREUR API:", e); }
}

// --- LOGIQUE D'AFFICHAGE DÉTAIL ---
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('prestaId');

    if (paramId) {
        console.log("   -> ID trouvé dans URL :", paramId);
        currentPrestationId = parseInt(paramId);
        
        const select = document.getElementById('service-select');
        if (select) select.value = currentPrestationId;

        updateDetailSection(currentPrestationId);
    } else {
        console.log("   -> Aucun ID dans l'URL, affichage par défaut.");
    }
}

function updateDetailSection(id) {
    // Conversion en entier pour être sûr
    const searchId = parseInt(id);
    
    // Recherche dans le tableau (comparaison souple au cas où)
    const service = allServices.find(s => s.id_prestation == searchId);

    const detailSection = document.getElementById('service-detail-section');

    if (service) {
        console.log("   -> Service trouvé pour affichage :", service);
        
        // Remplissage
        document.getElementById('detail-nom').textContent = service.nom;
        
        // Gestion des champs potentiellement vides
        document.getElementById('detail-desc').textContent = service.description || "Description non disponible.";
        document.getElementById('detail-duree').textContent = service.duree_minutes || "30"; 
        document.getElementById('detail-prix').textContent = service.tarif_forfait || "--";

        // Affichage
        if(detailSection) detailSection.classList.remove('d-none');
    } else {
        console.warn("   -> ATTENTION : Service introuvable pour l'ID", searchId);
        console.log("      Liste disponible :", allServices);
    }
}

function setupDropdownListeners() {
    const srvSelect = document.getElementById('service-select');
    if (srvSelect) {
        srvSelect.onchange = (e) => {
            currentPrestationId = e.target.value;
            updateDetailSection(currentPrestationId);
            loadCalendarView(toApiDate(currentWeekStart));
        };
    }

    const empSelect = document.getElementById('employee-select');
    if (empSelect) {
        empSelect.onchange = (e) => {
            currentEmployeeId = e.target.value === 'null' ? null : e.target.value;
            loadCalendarView(toApiDate(currentWeekStart));
        };
    }
}

// --- CALENDRIER (Inchangé) ---
async function fetchAvailability(startDate) {
    const empParam = currentEmployeeId ? `&employeeId=${currentEmployeeId}` : '';
    const url = `${API_BASE}?action=availability&businessId=${currentBusinessId}&startDate=${startDate}&prestaId=${currentPrestationId}${empParam}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.availability || {}; 
    } catch (e) { return {}; }
}

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
            for (let h = 9; h < 19; h++) {
                ['00', '30'].forEach(min => {
                    const slotTime = `${String(h).padStart(2,'0')}:${min}`;
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
            }
        } else {
             slotsList.innerHTML = '<div style="padding:10px;text-align:center;">Fermé</div>';
        }
        dayDiv.appendChild(slotsList);
        weekDiv.appendChild(dayDiv);
    }
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
        // Gestion affichage mes RDV
    } catch(e) {}
}