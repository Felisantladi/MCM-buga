// Script de optimización de rendimiento
(function() {
    'use strict';

    // Configuración de performance
    const CONFIG = {
        loadingTimeout: 3000,
        lazyLoadOffset: 100,
        debounceDelay: 100
    };

    // Optimizar carga de imágenes
    function optimizeImages() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: `${CONFIG.lazyLoadOffset}px`
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // Optimizar carga de CSS no crítico
    function loadNonCriticalCSS() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
        stylesheets.forEach(link => {
            if (link.onload === null) {
                link.onload = function() {
                    this.media = 'all';
                };
            }
        });
    }

    // Preconectar a dominios externos
    function preconnectExternalDomains() {
        const domains = [
            'https://fonts.googleapis.com',
            'https://cdnjs.cloudflare.com',
            'https://www.facebook.com'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // Optimizar formularios
    function optimizeForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                }
            });
        });
    }

    // Detectar conexión lenta y adaptar contenido
    function adaptToConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Desactivar funciones que consumen ancho de banda
                document.body.classList.add('slow-connection');
                
                // Reducir calidad de imágenes
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src.includes('.jpg') || img.src.includes('.png')) {
                        // Cambiar a versiones optimizadas si existen
                        const optimizedSrc = img.src.replace(/\.(jpg|png)/, '.webp');
                        img.src = optimizedSrc;
                    }
                });
            }
        }
    }

    // Inicializar optimizaciones
    function initOptimizations() {
        // Ejecutar inmediatamente
        preconnectExternalDomains();
        loadNonCriticalCSS();
        
        // Ejecutar cuando el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                optimizeImages();
                optimizeForms();
                adaptToConnection();
            });
        } else {
            optimizeImages();
            optimizeForms();
            adaptToConnection();
        }
    }

    // Ejecutar optimizaciones
    initOptimizations();

    // Registrar métricas de performance
    window.addEventListener('load', () => {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Performance metrics:', {
                'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                'TCP Connection': perfData.connectEnd - perfData.connectStart,
                'Request Time': perfData.responseStart - perfData.requestStart,
                'Response Time': perfData.responseEnd - perfData.responseStart,
                'DOM Processing': perfData.domContentLoadedEventStart - perfData.responseEnd,
                'Total Load Time': perfData.loadEventStart - perfData.navigationStart
            });
        }
    });

})();
