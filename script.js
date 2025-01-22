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
let startDate = '2025-01-01'; // Date de début corrigée pour 2025
let nombre = 1;
let dernierJour = localStorage.getItem('dernierJour') || getLocalDateString();
let completedDays = JSON.parse(localStorage.getItem('completedDays')) || {};

// Calculer le nombre de jours depuis le début
function calculateDayNumber() {
    const now = new Date();
    const timeZoneOffset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (timeZoneOffset * 60000));
    
    // On utilise directement le jour du mois
    const day = localNow.getDate();
    console.log('Jour du mois:', day);
    
    return day;
}

// Calculer le nombre de jours pour une date spécifique
function calculateDayNumberForDate(date) {
    const targetDate = new Date(date);
    return targetDate.getDate();
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
    
    // Mettre à jour le total des push-ups
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
        const todayNumber = calculateDayNumber(); // Utiliser le vrai numéro du jour
        console.log('Jour actuel:', todayNumber);
        console.log('CompletedDays avant:', completedDays);
        
        if (completedCheckbox.checked) {
            completedDays[today] = todayNumber;
            console.log('Ajout de', todayNumber, 'push-ups pour', today);
        } else {
            delete completedDays[today];
            console.log('Suppression des push-ups pour', today);
        }
        
        console.log('CompletedDays après:', completedDays);
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

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            registration.update();
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

// Shareable Image Functions
function createShareableImage() {
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 180;
    canvas.height = 180;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const nombre = document.getElementById('nombre').textContent;
    ctx.fillText(nombre, canvas.width/2, canvas.height/2);
    
    ctx.font = 'bold 24px -apple-system, system-ui';
    ctx.fillText('jours', canvas.width/2, canvas.height/2 + 40);
    
    return canvas.toDataURL('image/png');
}

function updateShareableImage() {
    const imageUrl = createShareableImage();
    const shareLink = document.getElementById('shareLink');
    shareLink.href = imageUrl;
    shareLink.download = 'compteur.png';
}

// Update shareable image every hour
updateShareableImage();
setInterval(updateShareableImage, 3600000);

// iOS Widget Support
if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.widget) {
    function updateWidget() {
        const count = document.getElementById('nombre').textContent;
        window.webkit.messageHandlers.widget.postMessage({
            type: 'updateWidget',
            data: {
                count: count
            }
        });
    }

    // Update widget every hour
    setInterval(updateWidget, 3600000);
    // Update widget on load
    updateWidget();
}

// PWA Installation Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'inline-block';
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                installButton.style.display = 'none';
            }
            deferredPrompt = null;
        }
    });
});

// Hide install button if app is already installed
window.addEventListener('appinstalled', () => {
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'none';
});
