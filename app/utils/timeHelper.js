/**
 * Utilitaires pour la gestion des créneaux horaires.
 * Approche mathématique (Minutes from Midnight) pour éviter les problèmes de Timezone/Date objects.
 */

// ----------------------------------------------------------------------
// Fonctions internes (Helpers)
// ----------------------------------------------------------------------

/**
 * Convertit une heure au format chaîne ("HH:mm" ou "HH:mm:ss") en minutes totales.
 * Ex: "09:30" -> 570
 * * @param {string} timeStr - L'heure à convertir.
 * @returns {number} Le nombre de minutes écoulées depuis 00:00.
 */
const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    // On splitte pour récupérer heures et minutes, on ignore les secondes si présentes
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
};

/**
 * Convertit un nombre de minutes en chaîne formatée "HH:mm".
 * Ex: 570 -> "09:30"
 * * @param {number} totalMinutes - Minutes totales depuis 00:00.
 * @returns {string} L'heure formatée.
 */
const minutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    // Padding pour s'assurer d'avoir toujours 2 chiffres (ex: 09:05)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// ----------------------------------------------------------------------
// Fonction Exportée
// ----------------------------------------------------------------------

/**
 * Génère une liste de créneaux horaires disponibles.
 * Exclut automatiquement les créneaux qui chevauchent les pauses.
 * * @param {string} startTime - Heure d'ouverture (ex: "09:00").
 * @param {string} endTime - Heure de fermeture (ex: "19:00").
 * @param {number} interval - Durée du créneau en minutes (ex: 30).
 * @param {Array<{start: string, end: string}>} breaks - Liste des pauses (ex: [{start: "12:00", end: "13:00"}]).
 * @returns {Array<{start: string, end: string, value: string}>} Liste des créneaux générés.
 */
const generateTimeSlots = (startTime, endTime, interval, breaks = []) => {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    const intervalMin = parseInt(interval, 10);

    // Pré-calcul des pauses en minutes pour optimiser la boucle
    const breaksMin = breaks.map(b => ({
        start: timeToMinutes(b.start),
        end: timeToMinutes(b.end)
    }));

    const slots = [];
    let currentMin = startMin;

    // Boucle tant que le créneau complet tient avant la fermeture
    while (currentMin + intervalMin <= endMin) {
        const slotStart = currentMin;
        const slotEnd = currentMin + intervalMin;

        // Détection de collision : Un créneau chevauche une pause si :
        // (DebutCréneau < FinPause) ET (FinCréneau > DebutPause)
        const isOverlappingBreak = breaksMin.some(pause => 
            slotStart < pause.end && slotEnd > pause.start
        );

        if (!isOverlappingBreak) {
            const formattedStart = minutesToTime(slotStart);
            slots.push({
                start: formattedStart,
                end: minutesToTime(slotEnd),
                value: formattedStart // Utile pour les selects HTML/Front
            });
        }

        // On avance au créneau suivant
        currentMin += intervalMin;
    }

    return slots;
};

module.exports = {
    generateTimeSlots,
    timeToMinutes, // Exporté au cas où besoin ailleurs
    minutesToTime  // Exporté au cas où besoin ailleurs
};