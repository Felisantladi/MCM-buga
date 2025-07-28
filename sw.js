const CACHE_NAME = 'mcm-buga-v1.5.0';
const STATIC_CACHE = 'mcm-static-v1.5.0';
const DYNAMIC_CACHE = 'mcm-dynamic-v1.5.0';
const AUDIO_CACHE = 'mcm-audio-v1.5.0';
const IMAGE_CACHE = 'mcm-images-v1.5.0';

// Recursos estáticos críticos - solo los esenciales
const STATIC_RESOURCES = [
    './',
    './index.html',
    './assets/css/variables.css',
    './assets/css/components.css',
    './assets/css/layout.css',
    './assets/css/interactive.css',
    './assets/css/navbar-fix.css',
    './assets/js/utils.js',
    './assets/js/interactivity.js',
    './assets/images/Logo MCm.png',
    './manifest.json'
];

// Recursos que se cachean dinámicamente
const DYNAMIC_RESOURCES = [
    './assets/audio/',
    './assets/images/',
    'https://fonts.googleapis.com/',
    'https://cdnjs.cloudflare.com/'
];

// Configuración de cache
const CACHE_CONFIG = {
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
    purgeOnQuotaError: true
};

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        Promise.all([
            // Cache de recursos estáticos
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            }),
            // Precargar recursos críticos
            preloadCriticalResources()
        ]).then(() => {
            console.log('Service Worker: Installation complete');
            self.skipWaiting();
        }).catch(error => {
            console.error('Service Worker: Installation failed', error);
        })
    );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            cleanupOldCaches(),
            // Tomar control inmediato
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker: Activation complete');
        })
    );
});

// Interceptar solicitudes de red
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // Ignorar solicitudes no HTTP/HTTPS
    if (!request.url.startsWith('http')) {
        return;
    }

    // Estrategias de cache por tipo de recurso
    if (isStaticResource(request)) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } else if (isAudioResource(request)) {
        event.respondWith(cacheFirst(request, AUDIO_CACHE));
    } else if (isImageResource(request)) {
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    } else if (isAPIRequest(request)) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } else if (isExternalResource(request)) {
        event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    } else {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// Estrategia Cache First (para recursos estáticos)
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('Cache hit:', request.url);
            return cachedResponse;
        }

        console.log('Cache miss, fetching:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache first strategy failed:', error);
        return new Response('Recurso no disponible offline', { 
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Network First (para contenido dinámico)
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', request.url);
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response('Contenido no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estrategia Stale While Revalidate (para imágenes y recursos externos)
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.error('Network fetch failed:', error);
        return null;
    });

    return cachedResponse || await fetchPromise || new Response('Recurso no disponible', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

// Precargar recursos críticos
async function preloadCriticalResources() {
    const criticalFonts = [
        'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@700;800&display=swap'
    ];

    try {
        const cache = await caches.open(STATIC_CACHE);
        await Promise.allSettled(
            criticalFonts.map(url => 
                fetch(url).then(response => {
                    if (response.ok) {
                        return cache.put(url, response);
                    }
                })
            )
        );
    } catch (error) {
        console.error('Failed to preload critical resources:', error);
    }
}

// Limpiar caches antiguos
async function cleanupOldCaches() {
    const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, AUDIO_CACHE, IMAGE_CACHE];
    const cacheNames = await caches.keys();
    
    await Promise.all(
        cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
                console.log('Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            }
        })
    );
}

// Utilidades para identificar tipos de recursos
function isStaticResource(request) {
    return STATIC_RESOURCES.some(resource => request.url.includes(resource)) ||
           request.url.includes('.css') ||
           request.url.includes('.js') ||
           request.url.includes('/manifest.json');
}

function isAudioResource(request) {
    return request.url.includes('/assets/audio/') ||
           request.url.includes('.mp3') ||
           request.url.includes('.wav') ||
           request.url.includes('.ogg');
}

function isImageResource(request) {
    return request.url.includes('/assets/images/') ||
           request.url.includes('.jpg') ||
           request.url.includes('.jpeg') ||
           request.url.includes('.png') ||
           request.url.includes('.webp') ||
           request.url.includes('.svg');
}

function isAPIRequest(request) {
    return request.url.includes('/api/') ||
           request.url.includes('/backend/');
}

function isExternalResource(request) {
    const url = new URL(request.url);
    return url.origin !== self.location.origin;
}

// Manejar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'CACHE_AUDIO':
                cacheAudioResource(event.data.url);
                break;
            case 'CLEAR_CACHE':
                clearSpecificCache(event.data.cacheName);
                break;
            case 'GET_CACHE_SIZE':
                getCacheSize().then(size => {
                    event.ports[0].postMessage({ size });
                });
                break;
        }
    }
});

// Cachear recurso de audio específico
async function cacheAudioResource(url) {
    try {
        const cache = await caches.open(AUDIO_CACHE);
        const response = await fetch(url);
        if (response.ok) {
            await cache.put(url, response);
            console.log('Audio cached:', url);
        }
    } catch (error) {
        console.error('Failed to cache audio:', error);
    }
}

// Limpiar cache específico
async function clearSpecificCache(cacheName) {
    try {
        await caches.delete(cacheName);
        console.log('Cache cleared:', cacheName);
    } catch (error) {
        console.error('Failed to clear cache:', error);
    }
}

// Obtener tamaño del cache
async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
        
        return totalSize;
    } catch (error) {
        console.error('Failed to calculate cache size:', error);
        return 0;
    }
}

// Notificaciones push (preparación para futuras implementaciones)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/images/Logo MCm.png',
            badge: '/assets/images/Logo MCm.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver más',
                    icon: '/assets/images/Logo MCm.png'
                },
                {
                    action: 'close',
                    title: 'Cerrar',
                    icon: '/assets/images/Logo MCm.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});