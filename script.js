// Suppression de la ligne qui réinitialise le localStorage
// localStorage.clear();

// Initialiser ou récupérer les données sauvegardées
let startDate = localStorage.getItem('startDate') || '2025-01-01'; // Date de début par défaut
let nombre = 1;
let dernierJour = localStorage.getItem('dernierJour') || getLocalDateString();
let completedDays = JSON.parse(localStorage.getItem('completedDays')) || {};

// Sauvegarder la date de début si elle n'existe pas encore
if (!localStorage.getItem('startDate')) {
    localStorage.setItem('startDate', startDate);
}

// Calculer le nombre de jours depuis le début
function calculateDayNumber() {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
}

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
        'android-install-title': 'Pour installer l\'application sur Android :',
        'android-install-step1': '1. Dans Chrome, appuyez sur',
        'android-install-step1-chrome': 'en haut à droite',
        'android-install-step2': '2. Sélectionnez "Installer l\'application"',
        'android-install-step3': '3. Suivez les instructions à l\'écran',
        'about-title': 'À propos du Challenge',
        'about-description': 'Relevez le défi des push-ups sur 365 jours ! Commencez doucement et progressez chaque jour pour atteindre vos objectifs de fitness. Une application simple et efficace pour suivre votre progression quotidienne. N\'oubliez pas d\'épingler sur votre écran d\'accueil !',
        'weekdays': ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        'install': 'Installer l\'application',
        'months': ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
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
        'android-install-title': 'To install the app on Android:',
        'android-install-step1': '1. In Chrome, tap',
        'android-install-step1-chrome': 'at the top right',
        'android-install-step2': '2. Select "Install app"',
        'android-install-step3': '3. Follow the on-screen instructions',
        'about-title': 'About the Challenge',
        'about-description': 'Take on the 365-day push-up challenge! Start slowly and progress each day to reach your fitness goals. A simple and effective app to track your daily progress. Don\'t forget to pin it to your home screen!',
        'weekdays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        'install': 'Install App',
        'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé, initialisation...');
    
    const nombreElement = document.getElementById('nombre');
    const jourElement = document.getElementById('jour');
    const checkbox = document.getElementById('completed');
    
    // Mettre à jour le nombre de push-ups pour aujourd'hui
    nombre = calculateDayNumber();
    nombreElement.textContent = nombre;
    
    // Vérifier si l'exercice a été complété aujourd'hui
    const today = getLocalDateString();
    if (completedDays[today]) {
        checkbox.checked = true;
    }
    
    // Mettre à jour l'affichage
    translateUI();
    updateCalendar();
    updateTotalDisplay();
    
    // Ajouter les écouteurs d'événements
    checkbox.addEventListener('change', (e) => {
        const today = getLocalDateString();
        if (e.target.checked) {
            completedDays[today] = nombre;
        } else {
            delete completedDays[today];
        }
        localStorage.setItem('completedDays', JSON.stringify(completedDays));
        updateCalendar();
        updateTotalDisplay();
    });

    // Variables pour l'installation PWA
    let deferredPrompt;
    const installButton = document.getElementById('installButton');
    const iosInstall = document.getElementById('iosInstall');
    const androidInstall = document.getElementById('androidInstall');

    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Empêcher Chrome 67 et versions antérieures d'afficher automatiquement l'invite
        e.preventDefault();
        // Stocker l'événement pour pouvoir le déclencher plus tard
        deferredPrompt = e;
        // Mettre à jour l'interface utilisateur pour afficher le bouton d'installation
        installButton.style.display = 'flex';
    });

    // Gestionnaire de clic pour le bouton d'installation
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        // Afficher l'invite d'installation
        deferredPrompt.prompt();
        // Attendre que l'utilisateur réponde à l'invite
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // On n'a plus besoin de l'invite, on la supprime
        deferredPrompt = null;
        // Cacher le bouton d'installation
        installButton.style.display = 'none';
    });

    // Écouter l'événement appinstalled
    window.addEventListener('appinstalled', (evt) => {
        console.log('Application installée avec succès');
        // Cacher le bouton d'installation et les instructions iOS
        installButton.style.display = 'none';
        iosInstall.style.display = 'none';
        androidInstall.style.display = 'none';
    });

    // Détecter le système d'exploitation et afficher les instructions appropriées
    function detectDevice() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isAndroid = /Android/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            window.navigator.standalone;
        
        const iosInstall = document.getElementById('iosInstall');
        const androidInstall = document.getElementById('androidInstall');
        const installButton = document.getElementById('installButton');
        
        if (!isStandalone) {
            if (isIOS) {
                iosInstall.style.display = 'block';
                androidInstall.style.display = 'none';
                installButton.style.display = 'none';
                // Animation pour iOS
                setTimeout(() => {
                    iosInstall.classList.add('pulse');
                    setTimeout(() => iosInstall.classList.remove('pulse'), 1000);
                }, 2000);
            } else if (isAndroid) {
                androidInstall.style.display = 'block';
                iosInstall.style.display = 'none';
                // Le bouton d'installation natif sera géré par Chrome
                // Animation pour Android
                setTimeout(() => {
                    androidInstall.classList.add('pulse');
                    setTimeout(() => androidInstall.classList.remove('pulse'), 1000);
                }, 2000);
            }
        } else {
            // L'application est déjà installée
            iosInstall.style.display = 'none';
            androidInstall.style.display = 'none';
            installButton.style.display = 'none';
        }
    }

    // Détecter le système et afficher les instructions appropriées
    detectDevice();
    
    // Vérifier si un jour est passé
    verifierJour();

    // Vérifier si l'application est en mode standalone (installée)
    function isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone || 
               document.referrer.includes('android-app://');
    }

    // Détecter le mode d'affichage
    function checkDisplayMode() {
        if (isAppInstalled()) {
            document.body.classList.add('standalone-mode');
            // Masquer les éléments d'installation
            if (installButton) installButton.style.display = 'none';
            if (iosInstall) iosInstall.style.display = 'none';
            if (androidInstall) androidInstall.style.display = 'none';
        }
    }

    // Vérifier la connexion internet
    function checkOnlineStatus() {
        const updateOnlineStatus = () => {
            const status = navigator.onLine;
            document.body.classList.toggle('offline', !status);
            
            // Afficher une notification de statut
            const notification = document.createElement('div');
            notification.className = `status-notification ${status ? 'online' : 'offline'}`;
            notification.textContent = status 
                ? (currentLang === 'fr' ? '✅ Connexion rétablie' : '✅ Back online')
                : (currentLang === 'fr' ? '⚠️ Mode hors ligne' : '⚠️ Offline mode');
            
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => document.body.removeChild(notification), 500);
            }, 2000);
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus(); // Vérifier le statut initial
    }

    // Amélioration de la détection iOS
    function detectiOS() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                            window.navigator.standalone;
        
        if (isIOS && !isStandalone) {
            iosInstall.style.display = 'block';
            // Ajouter une animation subtile pour attirer l'attention
            setTimeout(() => {
                iosInstall.classList.add('pulse');
                setTimeout(() => iosInstall.classList.remove('pulse'), 1000);
            }, 2000);
        }
    }

    // Initialisation améliorée
    checkDisplayMode();
    checkOnlineStatus();
    
    // Détecter iOS et afficher les instructions appropriées
    detectiOS();
    
    // Écouter les changements de mode d'affichage
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
        checkDisplayMode();
    });
    
    // Ajouter une notification de mise à jour disponible
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            const notification = document.createElement('div');
            notification.className = 'update-notification';
            notification.innerHTML = `
                <span>${currentLang === 'fr' ? 'Mise à jour disponible' : 'Update available'}</span>
                <button onclick="window.location.reload()">
                    ${currentLang === 'fr' ? 'Actualiser' : 'Refresh'}
                </button>
            `;
            document.body.appendChild(notification);
        });
    }
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
    const calendarDiv = document.getElementById('calendar');
    if (!calendarDiv) return;

    // Vider le calendrier
    calendarDiv.innerHTML = '';
    
    // Obtenir le premier jour du mois
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Mettre à jour le mois affiché
    const monthElement = document.getElementById('currentMonth');
    if (monthElement) {
        const monthNames = translations[currentLang].months || ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        monthElement.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    
    // Ajouter les jours vides au début
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day empty';
        calendarDiv.appendChild(emptyDay);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        const daySpan = document.createElement('span');
        daySpan.textContent = day;
        dayDiv.appendChild(daySpan);
        
        const currentDateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
        
        // Vérifier si le jour est complété
        if (completedDays[currentDateString]) {
            dayDiv.classList.add('completed');
        }
        
        // Vérifier si c'est aujourd'hui
        const today = getLocalDateString();
        if (currentDateString === today) {
            dayDiv.classList.add('today');
        }
        
        // Ajouter l'événement de clic pour les jours passés et aujourd'hui
        const dateToCheck = new Date(currentDateString);
        const nowDate = new Date(today);
        
        if (dateToCheck <= nowDate) {
            dayDiv.addEventListener('click', () => {
                // Basculer l'état complété pour ce jour
                if (completedDays[currentDateString]) {
                    delete completedDays[currentDateString];
                    dayDiv.classList.remove('completed');
                } else {
                    const dayNumber = calculateDayNumberForDate(currentDateString);
                    completedDays[currentDateString] = dayNumber;
                    dayDiv.classList.add('completed');
                }
                
                // Sauvegarder et mettre à jour l'affichage
                localStorage.setItem('completedDays', JSON.stringify(completedDays));
                updateTotalDisplay();
                
                // Mettre à jour la case à cocher si c'est aujourd'hui
                if (currentDateString === today) {
                    const checkbox = document.getElementById('completed');
                    if (checkbox) {
                        checkbox.checked = completedDays[currentDateString] !== undefined;
                    }
                }
            });
            
            dayDiv.style.cursor = 'pointer';
        }
        
        calendarDiv.appendChild(dayDiv);
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
    console.log('Calcul du total, completedDays:', completedDays);
    let total = 0;
    const values = Object.values(completedDays);
    console.log('Valeurs à additionner:', values);
    
    for (let i = 0; i < values.length; i++) {
        const pushups = parseInt(values[i]);
        console.log('Conversion de', values[i], 'en', pushups);
        if (!isNaN(pushups)) {
            total += pushups;
            console.log('Nouveau total:', total);
        }
    }
    
    console.log('Total final des push-ups:', total);
    return total;
}

// Fonction pour mettre à jour l'affichage du total
function updateTotalDisplay() {
    const totalPushups = document.getElementById('totalPushups');
    totalPushups.textContent = calculateTotalPushups();
}

// Détecter le système d'exploitation et afficher les instructions appropriées
function detectDevice() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone;
    
    const iosInstall = document.getElementById('iosInstall');
    const androidInstall = document.getElementById('androidInstall');
    const installButton = document.getElementById('installButton');
    
    if (!isStandalone) {
        if (isIOS) {
            iosInstall.style.display = 'block';
            androidInstall.style.display = 'none';
            installButton.style.display = 'none';
            // Animation pour iOS
            setTimeout(() => {
                iosInstall.classList.add('pulse');
                setTimeout(() => iosInstall.classList.remove('pulse'), 1000);
            }, 2000);
        } else if (isAndroid) {
            androidInstall.style.display = 'block';
            iosInstall.style.display = 'none';
            // Le bouton d'installation natif sera géré par Chrome
            // Animation pour Android
            setTimeout(() => {
                androidInstall.classList.add('pulse');
                setTimeout(() => androidInstall.classList.remove('pulse'), 1000);
            }, 2000);
        }
    } else {
        // L'application est déjà installée
        iosInstall.style.display = 'none';
        androidInstall.style.display = 'none';
        installButton.style.display = 'none';
    }
}

// Appeler la détection au chargement
window.addEventListener('load', detectDevice);

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
        checkbox.checked = false;
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

// Fonction pour calculer le nombre de jours depuis le début pour une date spécifique
function calculateDayNumberForDate(dateString) {
    const start = new Date(startDate);
    const date = new Date(dateString);
    const diffTime = Math.abs(date - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
}
