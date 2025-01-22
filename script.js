// Réinitialiser complètement le localStorage
// localStorage.clear();

// Traductions
const translations = {
    fr: {
        'title': 'Challenge Push-ups',
        'created-by': 'Créé par Thomas',
        'day': 'Jour',
        'pushups': 'push-ups',
        'completed': 'Complété aujourd\'hui',
        'total-pushups': 'Total des push-ups',
        'share': 'Partager ma progression',
        'copy': 'Copier',
        'ios-install-title': 'Pour installer l\'application sur iOS :',
        'ios-install-step1': 'Appuyez sur',
        'ios-install-step1-safari': 'dans Safari',
        'ios-install-step2': 'Choisissez "Sur l\'écran d\'accueil"',
        'about-title': 'À propos du Challenge',
        'about-description': 'Relevez le défi des push-ups sur 365 jours ! Commencez doucement et progressez chaque jour pour atteindre vos objectifs de fitness. Une application simple et efficace pour suivre votre progression quotidienne. N\'oubliez pas d\'épingler sur votre écran d\'accueil !',
        'weekdays': ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    },
    en: {
        'title': 'Push-ups Challenge',
        'created-by': 'Created by Thomas',
        'day': 'Day',
        'pushups': 'push-ups',
        'completed': 'Completed today',
        'total-pushups': 'Total push-ups',
        'share': 'Share my progress',
        'copy': 'Copy',
        'ios-install-title': 'To install the app on iOS:',
        'ios-install-step1': 'Tap',
        'ios-install-step1-safari': 'in Safari',
        'ios-install-step2': 'Choose "Add to Home Screen"',
        'about-title': 'About the Challenge',
        'about-description': 'Take on the 365-day push-up challenge! Start slowly and progress each day to reach your fitness goals. A simple and effective app to track your daily progress. Don\'t forget to pin it to your home screen!',
        'weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
};

// Langue par défaut
let currentLang = localStorage.getItem('language') || 'fr';

// Fonction pour mettre à jour la langue active dans l'interface
function updateActiveLanguageButton() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

// Fonction pour traduire l'interface
function translateUI() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            if (key === 'day') {
                element.textContent = `${translations[currentLang][key]} ${nombre}`;
            } else {
                element.textContent = translations[currentLang][key];
            }
        }
    });
    
    // Mettre à jour les jours de la semaine dans le calendrier
    document.querySelectorAll('.weekday').forEach((element, index) => {
        element.textContent = translations[currentLang].weekdays[index];
    });
    
    updateActiveLanguageButton();
    updateCalendar(); // Mettre à jour le calendrier après la traduction
}

// Fonction pour obtenir la date locale au format YYYY-MM-DD
function getLocalDateString() {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset();
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
    
    targetDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation...');
    
    const nombreElement = document.getElementById('nombre');
    const jourElement = document.getElementById('jour');
    const completedCheckbox = document.getElementById('completed');
    const shareBtn = document.getElementById('shareBtn');
    const shareOptions = document.getElementById('shareOptions');

    console.log('Éléments de partage:', {
        shareBtn: shareBtn ? 'trouvé' : 'non trouvé',
        shareOptions: shareOptions ? 'trouvé' : 'non trouvé'
    });

    // Initialiser l'affichage
    nombre = calculateDayNumber();
    nombreElement.textContent = nombre;
    jourElement.textContent = `${translations[currentLang].day} ${nombre}`;
    
    // Initialiser la case à cocher
    completedCheckbox.checked = localStorage.getItem('completedToday') === 'true';
    
    // Mettre à jour le total
    updateTotalDisplay();
    
    // Mettre à jour le calendrier
    updateCalendar();
    
    // Initialiser les traductions
    translateUI();
    
    // Initialiser les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            localStorage.setItem('language', currentLang);
            translateUI();
        });
    });
    
    // Gestion de la case à cocher
    completedCheckbox.addEventListener('change', () => {
        const today = getLocalDateString();
        if (completedCheckbox.checked) {
            completedDays[today] = nombre;
        } else {
            delete completedDays[today];
        }
        localStorage.setItem('completedDays', JSON.stringify(completedDays));
        localStorage.setItem('completedToday', completedCheckbox.checked);
        updateTotalDisplay();
        updateCalendar();
    });

    // Gestion du partage
    if (shareBtn && shareOptions) {
        console.log('Ajout des gestionnaires d\'événements pour le partage');
        
        shareBtn.addEventListener('click', (e) => {
            console.log('Clic sur le bouton de partage');
            e.stopPropagation();
            shareOptions.classList.toggle('visible');
            console.log('Menu de partage visible:', shareOptions.classList.contains('visible'));
        });

        // Fermer le menu de partage en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.share-container')) {
                console.log('Clic en dehors du menu de partage');
                shareOptions.classList.remove('visible');
            }
        });

        // Gestionnaire de partage
        const copyButton = document.querySelector('[data-platform="copy"]');
        console.log('Bouton de copie:', copyButton ? 'trouvé' : 'non trouvé');
        
        if (copyButton) {
            copyButton.addEventListener('click', async () => {
                console.log('Clic sur le bouton de copie');
                const message = createShareMessage();
                console.log('Message à copier:', message);
                
                try {
                    const success = await copyToClipboard(message);
                    console.log('Résultat de la copie:', success ? 'succès' : 'échec');
                    
                    // Créer et afficher la notification
                    const notification = document.createElement('div');
                    notification.className = 'copy-notification';
                    notification.textContent = success 
                        ? (currentLang === 'fr' ? '✅ Texte copié !' : '✅ Text copied!')
                        : (currentLang === 'fr' ? '❌ Erreur lors de la copie' : '❌ Copy failed');
                    
                    document.body.appendChild(notification);
                    console.log('Notification ajoutée');
                    
                    // Animation et suppression de la notification
                    setTimeout(() => {
                        notification.classList.add('fade-out');
                        setTimeout(() => {
                            document.body.removeChild(notification);
                            console.log('Notification supprimée');
                        }, 500);
                    }, 2000);
                    
                    // Fermer le menu de partage
                    shareOptions.classList.remove('visible');
                } catch (err) {
                    console.error('Erreur lors du partage:', err);
                }
            });
        } else {
            console.error('Bouton de copie non trouvé dans le DOM');
        }
    } else {
        console.error('Éléments de partage non trouvés dans le DOM');
    }

    // Vérifier si un jour est passé
    verifierJour();
});

// Fonction pour créer le message de partage
function createShareMessage() {
    const total = calculateTotalPushups();
    const completedDaysCount = Object.keys(completedDays).length;
    return currentLang === 'fr' 
        ? `🏋️‍♂️ Défi Push-ups : Jour ${nombre}\n` +
          `💪 Total : ${total} push-ups\n` +
          `✅ ${completedDaysCount} jours complétés\n` +
          `🎯 Objectif : 365 jours\n` +
          `#DéfiPushups #Fitness`
        : `🏋️‍♂️ Push-ups Challenge: Day ${nombre}\n` +
          `💪 Total: ${total} push-ups\n` +
          `✅ ${completedDaysCount} days completed\n` +
          `🎯 Goal: 365 days\n` +
          `#PushupChallenge #Fitness`;
}

// Fonction pour copier du texte
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        
        // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            return true;
        } catch (err) {
            console.error('Fallback copy failed:', err);
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// Calendrier
let currentDate = new Date();

function updateCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('currentMonth');
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Traduire le nom du mois selon la langue actuelle
    currentMonthElement.textContent = new Date(year, month).toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    calendarDays.innerHTML = '';
    
    // Mettre à jour les en-têtes des jours de la semaine
    document.querySelectorAll('.weekday').forEach((element, index) => {
        element.textContent = translations[currentLang].weekdays[index];
    });
    
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
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    
    // Vérifier si la nouvelle date est après la date de début
    const start = new Date(startDate);
    if (newDate.getTime() >= start.getTime()) {
        currentDate = newDate;
        updateCalendar();
    }
});

document.getElementById('nextMonth').addEventListener('click', () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    
    // Vérifier si la nouvelle date n'est pas dans le futur
    const now = new Date();
    if (newDate.getTime() <= now.getTime()) {
        currentDate = newDate;
        updateCalendar();
    }
});

// Fonction pour calculer le total des push-ups
function calculateTotalPushups() {
    return Object.values(completedDays).reduce((total, pushups) => total + pushups, 0);
}

// Fonction pour mettre à jour l'affichage du total
function updateTotalDisplay() {
    const totalPushups = document.getElementById('totalPushups');
    totalPushups.textContent = calculateTotalPushups();
}

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

// Vérifier si un jour est passé depuis la dernière visite
function verifierJour() {
    const aujourdhui = getLocalDateString();
    const maintenant = new Date();
    const dernierJourDate = new Date(dernierJour);
    
    // Vérifier si nous avons changé de mois
    const moisChange = maintenant.getMonth() !== dernierJourDate.getMonth() || 
                      maintenant.getFullYear() !== dernierJourDate.getFullYear();
    
    if (aujourdhui !== dernierJour) {
        console.log('Changement de jour détecté');
        console.log('Ancien jour:', dernierJour);
        console.log('Nouveau jour:', aujourdhui);
        console.log('Fuseau horaire:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log('Changement de mois:', moisChange);
        
        // Réinitialiser la case à cocher pour le nouveau jour
        completedCheckbox.checked = false;
        localStorage.setItem('completedToday', 'false');
        
        // Mettre à jour le dernier jour
        dernierJour = aujourdhui;
        nombre = calculateDayNumber();
        
        // Sauvegarder les nouvelles valeurs
        localStorage.setItem('dernierJour', dernierJour);
        localStorage.setItem('nombre', nombre);
        
        // Si nous avons changé de mois, mettre à jour la date courante du calendrier
        if (moisChange) {
            currentDate = new Date();
        }
    }
    
    // Mettre à jour l'affichage
    const nombreElement = document.getElementById('nombre');
    const jourElement = document.getElementById('jour');
    nombreElement.textContent = nombre;
    jourElement.textContent = `${translations[currentLang].day} ${nombre}`;
    updateCalendar();
}

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
        const nombreElement = document.getElementById('nombre');
        const jourElement = document.getElementById('jour');
        nombreElement.textContent = nombre;
        jourElement.textContent = `${translations[currentLang].day} ${nombre}`;
        updateCalendar();
    }
});
