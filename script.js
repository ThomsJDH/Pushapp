// Réinitialiser complètement le localStorage
// localStorage.clear();

// Fonction pour obtenir la date locale au format YYYY-MM-DD
function getLocalDateString() {
    // Utiliser la date locale de l'utilisateur
    const now = new Date();
    // Obtenir le décalage horaire en minutes
    const timeZoneOffset = now.getTimezoneOffset();
    // Ajuster la date en fonction du fuseau horaire
    const localDate = new Date(now.getTime() - (timeZoneOffset * 60000));
    return localDate.toISOString().split('T')[0];
}

// Initialiser ou récupérer les données sauvegardées
let startDate = localStorage.getItem('startDate') || '2025-01-01';
let nombre = 1;
let dernierJour = localStorage.getItem('dernierJour') || getLocalDateString();
let completedDays = JSON.parse(localStorage.getItem('completedDays')) || {};

// Calculer le nombre de jours depuis le début
function calculateDayNumber() {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (timeZoneOffset * 60000));
    const start = new Date(startDate);
    
    // Réinitialiser les heures pour une comparaison juste
    localNow.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = localNow.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Calculer le nombre de jours pour une date spécifique
function calculateDayNumberForDate(date) {
    const targetDate = new Date(date);
    const start = new Date(startDate);
    
    // Réinitialiser les heures pour une comparaison juste
    targetDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Initialiser le jour actuel
nombre = calculateDayNumber();
localStorage.setItem('nombre', nombre);

// Sauvegarder la date de début si elle n'existe pas
if (!localStorage.getItem('startDate')) {
    localStorage.setItem('startDate', startDate);
}

const nombreElement = document.getElementById('nombre');
const jourElement = document.getElementById('jour');
const completedCheckbox = document.getElementById('completed');
const totalPushups = document.getElementById('totalPushups');

// Vérifier si un jour est passé depuis la dernière visite
function verifierJour() {
    const aujourdhui = getLocalDateString();
    if (aujourdhui !== dernierJour) {
        console.log('Changement de jour détecté');
        console.log('Ancien jour:', dernierJour);
        console.log('Nouveau jour:', aujourdhui);
        console.log('Fuseau horaire:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        
        // Réinitialiser la case à cocher pour le nouveau jour
        completedCheckbox.checked = false;
        localStorage.setItem('completedToday', 'false');
        
        // Mettre à jour le dernier jour
        dernierJour = aujourdhui;
        nombre = calculateDayNumber();
        
        // Sauvegarder les nouvelles valeurs
        localStorage.setItem('dernierJour', dernierJour);
        localStorage.setItem('nombre', nombre);
    }
    
    // Mettre à jour l'affichage
    nombreElement.textContent = nombre;
    jourElement.textContent = `Jour ${nombre}`;
    updateCalendar();
}

// Calculer le total des push-ups
function calculateTotalPushups() {
    return Object.values(completedDays).reduce((total, pushups) => total + pushups, 0);
}

// Mettre à jour l'affichage du total
function updateTotalDisplay() {
    totalPushups.textContent = calculateTotalPushups();
}

// Charger l'état de la case à cocher depuis le localStorage
const isCompletedToday = localStorage.getItem('completedToday') === 'true';
completedCheckbox.checked = isCompletedToday;

// Afficher le nombre initial et le jour
nombreElement.textContent = nombre;
jourElement.textContent = `Jour ${nombre}`;

// Mettre à jour l'affichage initial du total
updateTotalDisplay();

// Gérer le changement de la case à cocher
completedCheckbox.addEventListener('change', (e) => {
    const today = getLocalDateString();
    localStorage.setItem('completedToday', e.target.checked);
    
    if (e.target.checked) {
        completedDays[today] = nombre;
    } else {
        delete completedDays[today];
    }
    
    localStorage.setItem('completedDays', JSON.stringify(completedDays));
    updateTotalDisplay();
    updateCalendar();
});

// Calendrier
let currentDate = new Date();

function updateCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    currentMonthElement.textContent = new Date(year, month).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric'
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    calendarDays.innerHTML = '';
    
    // Jours vides du début du mois
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day inactive';
        calendarDays.appendChild(emptyDay);
    }
    
    // Jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const today = getLocalDateString();
        const clickableDate = new Date(dateString);
        const currentDate = new Date(today);
        
        // Rendre le jour cliquable seulement s'il est dans le passé ou aujourd'hui
        if (clickableDate <= currentDate) {
            dayElement.classList.add('clickable');
            
            // Calculer le nombre de push-ups pour ce jour spécifique
            const dayNumber = calculateDayNumberForDate(dateString);
            
            if (completedDays[dateString]) {
                dayElement.classList.add('completed');
            }
            
            dayElement.addEventListener('click', () => {
                if (completedDays[dateString]) {
                    delete completedDays[dateString];
                    dayElement.classList.remove('completed');
                } else {
                    completedDays[dateString] = dayNumber;
                    dayElement.classList.add('completed');
                }
                
                localStorage.setItem('completedDays', JSON.stringify(completedDays));
                updateTotalDisplay();
                
                // Mettre à jour la case à cocher si c'est aujourd'hui
                if (dateString === today) {
                    completedCheckbox.checked = !completedCheckbox.checked;
                    localStorage.setItem('completedToday', completedCheckbox.checked);
                }
            });
        }
        
        if (dateString === today) {
            dayElement.classList.add('today');
        }
        
        calendarDays.appendChild(dayElement);
    }
}

// Navigation du calendrier
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// Initialisation
verifierJour();

// Vérifier toutes les heures si un jour est passé
setInterval(verifierJour, 3600000); // 3600000 ms = 1 heure

// Force le rafraîchissement des données au chargement
window.addEventListener('load', () => {
    // Effacer le cache local si nécessaire
    if (localStorage.getItem('lastUpdate') !== getLocalDateString()) {
        localStorage.setItem('lastUpdate', getLocalDateString());
        nombre = calculateDayNumber();
        localStorage.setItem('nombre', nombre);
        
        // Mettre à jour l'affichage
        nombreElement.textContent = nombre;
        jourElement.textContent = `Jour ${nombre}`;
        updateCalendar();
    }
});

// Gestion du partage
const shareBtn = document.getElementById('shareBtn');
const shareOptions = document.getElementById('shareOptions');

shareBtn.addEventListener('click', () => {
    shareOptions.classList.toggle('visible');
});

// Cacher les options de partage quand on clique ailleurs
document.addEventListener('click', (e) => {
    if (!e.target.closest('.share-container')) {
        shareOptions.classList.remove('visible');
    }
});

// Créer un élément pour la notification
const notification = document.createElement('div');
notification.className = 'copy-notification';
notification.style.display = 'none';
document.body.appendChild(notification);

// Fonction pour créer le message de partage
function createShareMessage() {
    const total = calculateTotalPushups();
    const completedDaysCount = Object.keys(completedDays).length;
    return `🏋️‍♂️ Défi Push-ups : Jour ${nombre}\n` +
           `💪 Total : ${total} push-ups\n` +
           `✅ ${completedDaysCount} jours complétés\n` +
           `🎯 Objectif : 365 jours\n` +
           `#DéfiPushups #Fitness`;
}

// Fonction pour copier du texte
function copyToClipboard(text) {
    // Créer un élément temporaire
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // S'assurer qu'il est hors de la vue
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        return true;
    } catch (err) {
        return false;
    } finally {
        document.body.removeChild(textArea);
    }
}

// Gestionnaire de partage pour chaque plateforme
document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', () => {
        const platform = button.dataset.platform;
        const message = createShareMessage();

        if (platform === 'copy') {
            const success = copyToClipboard(message);
            
            // Changer le texte et l'icône du bouton
            const originalContent = button.innerHTML;
            
            if (success) {
                button.innerHTML = '<i class="fas fa-check"></i> Copié !';
                button.classList.add('copied');
                notification.textContent = '✅ Texte copié !';
            } else {
                button.innerHTML = '<i class="fas fa-times"></i> Erreur';
                notification.textContent = '❌ Erreur lors de la copie';
            }
            
            // Afficher la notification
            notification.style.display = 'block';
            
            // Cacher la notification et restaurer le bouton après 2 secondes
            setTimeout(() => {
                notification.style.display = 'none';
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
        }
        
        // Cacher les options de partage
        shareOptions.classList.remove('visible');
    });
});

// Détecter iOS et afficher les instructions d'installation appropriées
function detectiOS() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone;
    const iosInstall = document.getElementById('iosInstall');
    
    if (isIOS && !isStandalone) {
        iosInstall.style.display = 'block';
    } else {
        iosInstall.style.display = 'none';
    }
}

// Appeler la détection au chargement
window.addEventListener('load', detectiOS);
