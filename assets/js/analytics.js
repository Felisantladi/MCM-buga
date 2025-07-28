// Sistema de Analytics Básico para MCM Buga
class Analytics {
    constructor(options = {}) {
        this.options = {
            trackPageViews: true,
            trackUserInteractions: true,
            trackAudioPlayback: true,
            trackDownloads: true,
            trackFormSubmissions: true,
            trackScrollDepth: true,
            trackTimeOnPage: true,
            sendInterval: 30000, // 30 segundos
            maxEventsBuffer: 100,
            privacyMode: true,
            ...options
        };
        
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.events = [];
        this.pageStartTime = Date.now();
        this.maxScrollDepth = 0;
        this.audioPlaytime = {};
        this.lastActiveTime = Date.now();
        
        this.init();
    }

    init() {
        console.log('Analytics initialized for MCM Buga');
        
        if (this.options.trackPageViews) {
            this.trackPageView();
        }
        
        if (this.options.trackUserInteractions) {
            this.setupInteractionTracking();
        }
        
        if (this.options.trackAudioPlayback) {
            this.setupAudioTracking();
        }
        
        if (this.options.trackDownloads) {
            this.setupDownloadTracking();
        }
        
        if (this.options.trackFormSubmissions) {
            this.setupFormTracking();
        }
        
        if (this.options.trackScrollDepth) {
            this.setupScrollTracking();
        }
        
        if (this.options.trackTimeOnPage) {
            this.setupTimeTracking();
        }
        
        // Enviar eventos periódicamente
        setInterval(() => {
            this.sendPendingEvents();
        }, this.options.sendInterval);
        
        // Enviar eventos antes de cerrar la página
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_exit', {
                timeOnPage: Date.now() - this.pageStartTime,
                maxScrollDepth: this.maxScrollDepth
            });
            this.sendPendingEvents(true);
        });
        
        // Detectar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden');
            } else {
                this.trackEvent('page_visible');
                this.lastActiveTime = Date.now();
            }
        });
    }

    // Generar ID de sesión único
    generateSessionId() {
        return 'mcm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtener o generar ID de usuario (respetando privacidad)
    getUserId() {
        if (!this.options.privacyMode) {
            let userId = localStorage.getItem('mcm_user_id');
            if (!userId) {
                userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('mcm_user_id', userId);
            }
            return userId;
        }
        return 'anonymous';
    }

    // Rastrear visualización de página
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            timestamp: Date.now()
        };
        
        this.trackEvent('page_view', pageData);
    }

    // Configurar rastreo de interacciones
    setupInteractionTracking() {
        // Clicks en botones
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, .card, .audio-card');
            if (target) {
                const elementData = {
                    elementType: target.tagName.toLowerCase(),
                    elementClass: target.className,
                    elementId: target.id,
                    elementText: target.textContent?.substring(0, 100),
                    section: this.getElementSection(target)
                };
                
                this.trackEvent('element_click', elementData);
            }
        });
        
        // Hover en elementos importantes
        const importantElements = document.querySelectorAll('.card, .btn, .navbar-brand, .audio-card');
        importantElements.forEach(element => {
            let hoverStart;
            
            element.addEventListener('mouseenter', () => {
                hoverStart = Date.now();
            });
            
            element.addEventListener('mouseleave', () => {
                if (hoverStart) {
                    const hoverDuration = Date.now() - hoverStart;
                    if (hoverDuration > 1000) { // Solo rastrear hovers largos
                        this.trackEvent('element_hover', {
                            elementClass: element.className,
                            duration: hoverDuration,
                            section: this.getElementSection(element)
                        });
                    }
                }
            });
        });
    }

    // Configurar rastreo de audio
    setupAudioTracking() {
        const audioElements = document.querySelectorAll('audio');
        
        audioElements.forEach((audio, index) => {
            const audioId = `audio_${index}`;
            this.audioPlaytime[audioId] = 0;
            
            audio.addEventListener('play', () => {
                this.trackEvent('audio_play', {
                    audioId,
                    audioSrc: audio.src,
                    audioTitle: audio.closest('.card')?.querySelector('.card-title')?.textContent
                });
            });
            
            audio.addEventListener('pause', () => {
                this.trackEvent('audio_pause', {
                    audioId,
                    currentTime: audio.currentTime,
                    duration: audio.duration
                });
            });
            
            audio.addEventListener('ended', () => {
                this.trackEvent('audio_complete', {
                    audioId,
                    totalDuration: audio.duration
                });
            });
            
            // Rastrear progreso cada 30 segundos
            audio.addEventListener('timeupdate', () => {
                const currentTime = Math.floor(audio.currentTime);
                if (currentTime > 0 && currentTime % 30 === 0) {
                    this.trackEvent('audio_progress', {
                        audioId,
                        currentTime,
                        duration: audio.duration,
                        progress: (currentTime / audio.duration) * 100
                    });
                }
            });
        });
    }

    // Configurar rastreo de descargas
    setupDownloadTracking() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[download], a[href$=".mp3"], a[href$=".pdf"]');
            if (link) {
                this.trackEvent('file_download', {
                    fileName: link.download || link.href.split('/').pop(),
                    fileType: link.href.split('.').pop(),
                    fileUrl: link.href,
                    linkText: link.textContent?.substring(0, 100)
                });
            }
        });
    }

    // Configurar rastreo de formularios
    setupFormTracking() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, index) => {
            const formId = form.id || `form_${index}`;
            
            form.addEventListener('submit', (e) => {
                const formData = new FormData(form);
                const fields = {};
                
                // Solo rastrear nombres de campos, no valores (privacidad)
                for (let [key] of formData.entries()) {
                    fields[key] = 'filled';
                }
                
                this.trackEvent('form_submit', {
                    formId,
                    fields: Object.keys(fields),
                    fieldCount: Object.keys(fields).length
                });
            });
            
            // Rastrear campos que se enfocan
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    this.trackEvent('form_field_focus', {
                        formId,
                        fieldName: input.name || input.id,
                        fieldType: input.type
                    });
                });
            });
        });
    }

    // Configurar rastreo de scroll
    setupScrollTracking() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollDepth = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );
                
                if (scrollDepth > this.maxScrollDepth) {
                    this.maxScrollDepth = scrollDepth;
                    
                    // Rastrear milestones importantes
                    if (scrollDepth >= 25 && scrollDepth < 50 && this.maxScrollDepth < 25) {
                        this.trackEvent('scroll_milestone', { depth: 25 });
                    } else if (scrollDepth >= 50 && scrollDepth < 75 && this.maxScrollDepth < 50) {
                        this.trackEvent('scroll_milestone', { depth: 50 });
                    } else if (scrollDepth >= 75 && scrollDepth < 90 && this.maxScrollDepth < 75) {
                        this.trackEvent('scroll_milestone', { depth: 75 });
                    } else if (scrollDepth >= 90 && this.maxScrollDepth < 90) {
                        this.trackEvent('scroll_milestone', { depth: 90 });
                    }
                }
            }, 250);
        });
    }

    // Configurar rastreo de tiempo
    setupTimeTracking() {
        // Rastrear tiempo activo vs inactivo
        let inactiveTimeout;
        
        const resetInactiveTimer = () => {
            clearTimeout(inactiveTimeout);
            this.lastActiveTime = Date.now();
            
            inactiveTimeout = setTimeout(() => {
                this.trackEvent('user_inactive', {
                    inactiveAfter: 60000 // 1 minuto
                });
            }, 60000);
        };
        
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetInactiveTimer, true);
        });
        
        resetInactiveTimer();
    }

    // Rastrear evento personalizado
    trackEvent(eventName, data = {}) {
        const event = {
            id: this.generateEventId(),
            name: eventName,
            data: {
                ...data,
                sessionId: this.sessionId,
                userId: this.userId,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent.substring(0, 200) // Limitado por privacidad
            }
        };
        
        this.events.push(event);
        
        // Limpiar buffer si está lleno
        if (this.events.length > this.options.maxEventsBuffer) {
            this.events = this.events.slice(-this.options.maxEventsBuffer);
        }
        
        console.log('Event tracked:', eventName, data);
    }

    // Generar ID de evento único
    generateEventId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Obtener sección del elemento
    getElementSection(element) {
        const section = element.closest('section, header, footer, main');
        return section?.id || section?.className || 'unknown';
    }

    // Enviar eventos pendientes
    async sendPendingEvents(forceSync = false) {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        const payload = {
            events: eventsToSend,
            metadata: {
                site: 'MCM Buga',
                version: '1.0.0',
                timestamp: Date.now()
            }
        };
        
        if (forceSync) {
            // Envío síncrono para beforeunload
            await this.sendToAnalyticsEndpoint(payload);
        } else if (navigator.sendBeacon) {
            // Usar sendBeacon para envío asíncrono
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            const success = navigator.sendBeacon('/api/analytics', blob);
            if (!success) {
                // Fallback si sendBeacon falla
                await this.sendToAnalyticsEndpoint(payload);
            }
        } else {
            // Fallback para navegadores que no soportan sendBeacon
            await this.sendToAnalyticsEndpoint(payload);
        }
    }

    // Enviar a endpoint de analytics
    async sendToAnalyticsEndpoint(payload) {
        try {
            const response = await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('📊 Analytics sent successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Error sending analytics:', error);
            // Guardar en localStorage como fallback
            this.saveToLocalStorage(payload);
            return null;
        }
    }

    // Guardar en localStorage como fallback
    saveToLocalStorage(payload) {
        try {
            const existing = JSON.parse(localStorage.getItem('mcm_analytics') || '[]');
            existing.push(...payload.events);
            
            // Mantener solo los últimos 1000 eventos
            const recent = existing.slice(-1000);
            localStorage.setItem('mcm_analytics', JSON.stringify(recent));
            
            console.log('📱 Analytics saved to localStorage as fallback');
        } catch (error) {
            console.warn('Could not save analytics to localStorage:', error);
        }
    }

    // Obtener estadísticas de la sesión actual
    getSessionStats() {
        const currentTime = Date.now();
        const timeOnPage = currentTime - this.pageStartTime;
        
        return {
            sessionId: this.sessionId,
            timeOnPage,
            maxScrollDepth: this.maxScrollDepth,
            eventsTracked: this.events.length,
            lastActiveTime: this.lastActiveTime,
            isActive: (currentTime - this.lastActiveTime) < 60000
        };
    }

    // Obtener estadísticas almacenadas
    getStoredStats() {
        try {
            const events = JSON.parse(localStorage.getItem('mcm_analytics') || '[]');
            
            const stats = {
                totalEvents: events.length,
                eventTypes: {},
                sessions: new Set(),
                audioPlays: 0,
                formSubmissions: 0,
                downloads: 0,
                pageViews: 0
            };
            
            events.forEach(event => {
                stats.eventTypes[event.name] = (stats.eventTypes[event.name] || 0) + 1;
                stats.sessions.add(event.data.sessionId);
                
                switch (event.name) {
                    case 'audio_play':
                        stats.audioPlays++;
                        break;
                    case 'form_submit':
                        stats.formSubmissions++;
                        break;
                    case 'file_download':
                        stats.downloads++;
                        break;
                    case 'page_view':
                        stats.pageViews++;
                        break;
                }
            });
            
            stats.uniqueSessions = stats.sessions.size;
            delete stats.sessions;
            
            return stats;
        } catch (error) {
            console.warn('Could not retrieve stored analytics:', error);
            return null;
        }
    }

    // Limpiar datos almacenados
    clearStoredData() {
        localStorage.removeItem('mcm_analytics');
        localStorage.removeItem('mcm_user_id');
        console.log('Analytics data cleared');
    }

    // Configurar modo de privacidad
    setPrivacyMode(enabled) {
        this.options.privacyMode = enabled;
        if (enabled) {
            this.userId = 'anonymous';
            this.clearStoredData();
        } else {
            this.userId = this.getUserId();
        }
    }

    // API para rastreo personalizado
    track(eventName, properties = {}) {
        this.trackEvent(eventName, properties);
    }

    // Método para identificar usuario (cuando sea apropiado)
    identify(userProperties = {}) {
        if (!this.options.privacyMode) {
            this.trackEvent('user_identify', {
                properties: userProperties
            });
        }
    }

    // Método para rastrear conversiones
    trackConversion(conversionType, value = null) {
        this.trackEvent('conversion', {
            type: conversionType,
            value: value,
            timestamp: Date.now()
        });
    }
}

// Inicializar Analytics cuando el DOM esté listo
let analytics;
document.addEventListener('DOMContentLoaded', () => {
    analytics = new Analytics({
        privacyMode: true, // Respetamos la privacidad por defecto
        trackPageViews: true,
        trackUserInteractions: true,
        trackAudioPlayback: true,
        trackDownloads: true,
        trackFormSubmissions: true,
        trackScrollDepth: true,
        trackTimeOnPage: true
    });
});

// Exponer para uso global
window.Analytics = Analytics;
window.analytics = analytics;

// API simplificada para uso en HTML
window.trackEvent = (name, data) => {
    if (window.analytics) {
        window.analytics.track(name, data);
    }
};

window.trackConversion = (type, value) => {
    if (window.analytics) {
        window.analytics.trackConversion(type, value);
    }
};