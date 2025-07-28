// Script para manejar errores menores y optimizar la experiencia del usuario

// Manejo de errores globales
window.addEventListener('error', function(e) {
    // Solo logear errores críticos, ignorar warnings menores
    if (e.error && !e.error.message.includes('Facebook') && 
        !e.error.message.includes('font') && 
        !e.error.message.includes('Illegal invocation')) {
        console.error('Error crítico:', e.error.message);
    }
});

// Manejo de errores de recursos
window.addEventListener('error', function(e) {
    if (e.target !== window) {
        const element = e.target;
        const tagName = element.tagName.toLowerCase();
        
        // Manejo específico por tipo de elemento
        switch(tagName) {
            case 'img':
                // Solo mostrar warning si no es una URL vacía o inválida
                if (element.src && element.src !== window.location.href && !element.src.includes('placehold.co')) {
                    console.warn('Image failed to load:', element.src);
                    // Fallback para imágenes
                    element.src = 'https://placehold.co/400x300/1a3a7a/ffffff?text=MCM+Buga';
                }
                break;
            case 'audio':
                console.warn('Audio failed to load:', element.src);
                break;
            case 'script':
                if (!element.src.includes('test') && !element.src.includes('diagnostic')) {
                    console.warn('Script failed to load:', element.src);
                }
                break;
            case 'link':
                console.warn('Stylesheet failed to load:', element.href);
                break;
        }
    }
}, true);

// Optimización de performance
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading mejorado para imágenes
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Precargar recursos críticos
    const criticalResources = [
        'assets/css/components.css',
        'assets/css/layout.css',
        'assets/js/interactivity.js'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });
});

// Manejo mejorado de Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'CACHE_ERROR') {
            console.warn('Cache error:', event.data.url);
        }
    });
}

// Función para verificar conectividad
function checkConnectivity() {
    if ('navigator' in window && 'onLine' in navigator) {
        const updateOnlineStatus = () => {
            if (navigator.onLine) {
                document.body.classList.remove('offline');
            } else {
                document.body.classList.add('offline');
                console.warn('App is offline');
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }
}

// Inicializar verificación de conectividad
checkConnectivity();

// Manejo de memoria para prevenir leaks
window.addEventListener('beforeunload', function() {
    // Limpiar referencias
    if (window.audioPlayers) {
        window.audioPlayers.forEach(player => {
            if (player && typeof player.pause === 'function') {
                player.pause();
            }
        });
    }
});

console.log('✅ Error handler and optimizations loaded');
