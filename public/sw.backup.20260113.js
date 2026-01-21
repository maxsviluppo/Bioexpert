// Service Worker per Notifiche Push
const CACHE_NAME = 'bioexpert-v1.2';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Installazione
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Attivazione
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch con cache-first strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

// Gestione notifiche push
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || '🌱 BioExpert';
    const options = {
        body: data.body || 'Hai piante che necessitano cure!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'plant-care',
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'Apri App' },
            { action: 'close', title: 'Chiudi' }
        ],
        data: data
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Click su notifica
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Controllo periodico (Background Sync)
self.addEventListener('sync', (event) => {
    if (event.tag === 'check-plants') {
        event.waitUntil(checkPlantsAndNotify());
    }
});

async function checkPlantsAndNotify() {
    try {
        // Recupera username da IndexedDB o localStorage
        const username = await getStoredUsername();
        if (!username) return;

        // Fetch piante in scadenza
        const response = await fetch(`/api/plants?username=${username}`);
        const data = await response.json();

        if (data.success && data.data) {
            const plantsNeedingCare = data.data.filter(plant => {
                return plant.next_check_at && new Date(plant.next_check_at) < new Date();
            });

            if (plantsNeedingCare.length > 0) {
                const plantNames = plantsNeedingCare.map(p => p.plant_name).join(', ');
                self.registration.showNotification('🚨 Piante da Curare!', {
                    body: `${plantsNeedingCare.length} piante necessitano attenzione: ${plantNames}`,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    tag: 'plant-care-reminder',
                    requireInteraction: true
                });
            }
        }
    } catch (error) {
        console.error('Background check failed:', error);
    }
}

async function getStoredUsername() {
    // Prova a recuperare da cache/storage
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    // Implementazione semplificata - in produzione usare IndexedDB
    return null; // Placeholder
}
