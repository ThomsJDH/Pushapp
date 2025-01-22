// Réinitialiser complètement le localStorage
localStorage.clear();

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
        'install': 'Installer l\'application'
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
        'install': 'Install App'
    }
};

// Variables globales
let currentLang = localStorage.getItem('language') || 'fr';
const START_DATE = '2025-01-01';
let completedDays = {};
let nombre = 1;
let dernierJour = '';

// Fonction pour calculer le nombre de jours pour une date spécifique
function calculateDayNumberForDate(date) {
    const targetDate = new Date(date);
    const start = new Date(START_DATE);
    const diffTime = Math.abs(targetDate - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Initialisation des données
function initializeData() {
    try {
        completedDays = JSON.parse(localStorage.getItem('completedDays')) || {};
        dernierJour = localStorage.getItem('dernierJour') || getLocalDateString();
        nombre = parseInt(localStorage.getItem('nombre')) || calculateDayNumber();
        
        // Vérifier si nous sommes un nouveau jour
        const aujourdhui = getLocalDateString();
        if (dernierJour !== aujourdhui) {
            nombre = calculateDayNumber();
            dernierJour = aujourdhui;
            const completedCheckbox = document.getElementById('completed');
            if (completedCheckbox) {
                completedCheckbox.checked = false;
            }
        } else {
            const completedCheckbox = document.getElementById('completed');
            if (completedCheckbox) {
                completedCheckbox.checked = localStorage.getItem('completedToday') === 'true';
            }
        }
        
        updateDisplay();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        resetData();
    }
}

// Fonction pour sauvegarder l'état
function saveState() {
    try {
        const completedCheckbox = document.getElementById('completed');
        const data = {
            completedDays,
            dernierJour,
            nombre,
            completedToday: completedCheckbox ? completedCheckbox.checked : false,
            lastUpdate: getLocalDateString()
        };
        
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return false;
    }
}

// Fonction pour réinitialiser les données
function resetData() {
    completedDays = {};
    nombre = calculateDayNumber();
    dernierJour = getLocalDateString();
    const completedCheckbox = document.getElementById('completed');
    if (completedCheckbox) {
        completedCheckbox.checked = false;
    }
    saveState();
    updateDisplay();
}

// Fonction pour obtenir la date locale
function getLocalDateString() {
    return new Date().toISOString().split('T')[0];
}

// Fonction pour calculer le nombre de jours
function calculateDayNumber() {
    const today = new Date();
    const start = new Date(START_DATE);
    const diffTime = Math.abs(today - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Mettre à jour l'affichage
function updateDisplay() {
    const nombreElement = document.getElementById('nombre');
    const jourElement = document.getElementById('jour');
    
    if (nombreElement) {
        nombreElement.textContent = nombre;
    }
    if (jourElement) {
        jourElement.textContent = `${translations[currentLang].day} ${nombre}`;
    }
    
    updateTotalDisplay();
    updateCalendar();
}

// Gérer le partage
function handleShare() {
    const total = calculateTotalPushups();
    const today = new Date().toLocaleDateString();
    const shareText = `🏋️‍♂️ Challenge Push-ups\n${today}\nJour ${nombre}: ${nombre} pompes\nTotal: ${total} pompes\n💪 #PushupChallenge`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Challenge Push-ups',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        copyToClipboard(shareText);
    }
}

// Copier dans le presse-papier
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Copié dans le presse-papier !');
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        showToast('Erreur lors de la copie');
    }
    document.body.removeChild(textarea);
}

// Afficher un toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Calculer le total des pompes
function calculateTotalPushups() {
    return Object.entries(completedDays)
        .filter(([_, completed]) => completed)
        .reduce((total, [date]) => total + calculateDayNumberForDate(date), 0);
}

// Mettre à jour l'affichage du total
function updateTotalDisplay() {
    const total = calculateTotalPushups();
    const totalElement = document.getElementById('totalPushups');
    if (totalElement) {
        totalElement.textContent = total;
    }
}

// Gestionnaire d'événements
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    
    // Gérer la case à cocher
    const completedCheckbox = document.getElementById('completed');
    if (completedCheckbox) {
        completedCheckbox.addEventListener('change', (e) => {
            const date = getLocalDateString();
            completedDays[date] = e.target.checked;
            saveState();
            updateDisplay();
        });
    }
    
    // Gérer le partage
    const shareButton = document.getElementById('shareButton');
    const copyButton = document.getElementById('copyButton');
    
    if (shareButton) {
        shareButton.addEventListener('click', handleShare);
    }
    
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const total = calculateTotalPushups();
            const shareText = `🏋️‍♂️ Challenge Push-ups\nJour ${nombre}: ${nombre} pompes\nTotal: ${total} pompes\n💪 #PushupChallenge`;
            copyToClipboard(shareText);
        });
    }
    
    // Gérer les onglets
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const tabContent = document.getElementById(`${button.dataset.tab}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
});

// Sauvegarder avant de fermer
window.addEventListener('beforeunload', saveState);

// Sauvegarder périodiquement
setInterval(saveState, 30000);

// Gérer la visibilité
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        saveState();
    } else {
        initializeData();
    }
});

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
            const pushups = day; // Le nombre de push-ups est égal au jour du mois
            
            if (completedDays[dateString]) {
                dayElement.classList.add('completed');
            }
            
            dayElement.addEventListener('click', () => {
                if (completedDays[dateString]) {
                    delete completedDays[dateString];
                    dayElement.classList.remove('completed');
                } else {
                    completedDays[dateString] = pushups;
                    dayElement.classList.add('completed');
                }
                
                saveState();
                updateTotalDisplay();
                
                // Mettre à jour la case à cocher si c'est aujourd'hui
                if (dateString === today) {
                    const completedCheckbox = document.getElementById('completed');
                    if (completedCheckbox) {
                        completedCheckbox.checked = !completedCheckbox.checked;
                    }
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
    const start = new Date(START_DATE);
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
        const completedCheckbox = document.getElementById('completed');
        if (completedCheckbox) {
            completedCheckbox.checked = false;
        }
        
        // Mettre à jour le dernier jour
        dernierJour = aujourdhui;
        nombre = calculateDayNumber();
        
        // Sauvegarder les nouvelles valeurs
        saveState();
        
        // Si nous avons changé de mois, mettre à jour la date courante du calendrier
        if (moisChange) {
            currentDate = new Date();
        }
    }
    
    // Mettre à jour l'affichage
    const nombreElement = document.getElementById('nombre');
    const jourElement = document.getElementById('jour');
    if (nombreElement) {
        nombreElement.textContent = nombre;
    }
    if (jourElement) {
        jourElement.textContent = `${translations[currentLang].day} ${nombre}`;
    }
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
        
        // Mettre à jour l'affichage
        const nombreElement = document.getElementById('nombre');
        const jourElement = document.getElementById('jour');
        if (nombreElement) {
            nombreElement.textContent = nombre;
        }
        if (jourElement) {
            jourElement.textContent = `${translations[currentLang].day} ${nombre}`;
        }
        updateCalendar();
    }
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

// Appeler la détection au chargement
window.addEventListener('load', detectDevice);

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

// Détecter le système et afficher les instructions appropriées
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
