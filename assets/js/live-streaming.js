// Sistema de Transmisiones en Vivo de Facebook
class LiveStreaming {
    constructor() {
        this.facebookPageId = 'Iglesiamisioncarismaticaalmundobuga';
        this.isLive = false;
        this.currentStream = null;
        this.streamHistory = [];
        this.checkInterval = null;
        this.historyOffset = 0;
        this.historyLimit = 6;
        
        this.init();
    }

    async init() {
        console.log('Live Streaming system initialized');
        
        // Cargar SDK de Facebook
        await this.loadFacebookSDK();
        
        // Verificar estado de transmisión
        this.checkLiveStatus();
        
        // Cargar historial inicial
        this.loadStreamHistory();
        
        // Configurar verificación periódica
        this.startPeriodicCheck();
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    // Cargar SDK de Facebook
    loadFacebookSDK() {
        return new Promise((resolve) => {
            if (window.FB) {
                resolve();
                return;
            }

            window.fbAsyncInit = function() {
                FB.init({
                    appId: 'your-app-id', // Reemplazar con tu App ID
                    cookie: true,
                    xfbml: true,
                    version: 'v19.0'
                });
                resolve();
            };

            // Cargar SDK si no existe
            if (!document.getElementById('facebook-jssdk')) {
                const script = document.createElement('script');
                script.id = 'facebook-jssdk';
                script.src = 'https://connect.facebook.net/es_LA/sdk.js';
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        });
    }

    // Verificar estado de transmisión en vivo
    async checkLiveStatus() {
        try {
            // Simulación de verificación (en producción usarías la API de Facebook)
            const isCurrentlyLive = await this.checkIfStreamIsLive();
            
            if (isCurrentlyLive !== this.isLive) {
                this.isLive = isCurrentlyLive;
                this.updateLiveStatus();
                
                if (this.isLive) {
                    this.showLiveStream();
                    this.notifyNewLiveStream();
                } else {
                    this.showStreamPlaceholder();
                }
            }
            
        } catch (error) {
            console.error('Error checking live status:', error);
            this.handleStreamError();
        }
    }

    // Simular verificación de transmisión (reemplazar con API real)
    async checkIfStreamIsLive() {
        // En producción, esto haría una llamada a la API de Facebook Graph
        // Para simulación, usaremos horarios de culto
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay();
        
        // Simular transmisión en vivo durante horarios de culto
        // Viernes (5) a las 19:30 o Domingo (0) a las 9:00
        const isFridayService = dayOfWeek === 5 && hour >= 19 && hour <= 21;
        const isSundayService = dayOfWeek === 0 && hour >= 9 && hour <= 11;
        
        return isFridayService || isSundayService;
    }

    // Actualizar indicador de estado
    updateLiveStatus() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        const nextStream = document.getElementById('nextStream');
        
        if (this.isLive) {
            statusIndicator.className = 'status-indicator live';
            statusText.textContent = 'Transmisión en vivo';
            nextStream.style.display = 'none';
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Transmisión no activa';
            nextStream.style.display = 'flex';
            this.updateNextStreamTime();
        }
    }

    // Calcular próxima transmisión
    updateNextStreamTime() {
        const now = new Date();
        const nextStream = this.getNextStreamTime(now);
        
        document.querySelector('#nextStream span').innerHTML = 
            `Próxima transmisión: <strong>${nextStream}</strong>`;
    }

    // Obtener hora de próxima transmisión
    getNextStreamTime(now) {
        const dayOfWeek = now.getDay();
        const hour = now.getHours();
        
        // Viernes 19:30
        if (dayOfWeek < 5 || (dayOfWeek === 5 && hour < 19)) {
            return 'Viernes 7:30 PM';
        }
        // Domingo 9:00
        else if (dayOfWeek === 5 && hour >= 19) {
            return 'Domingo 9:00 AM';
        }
        else if (dayOfWeek === 6 || (dayOfWeek === 0 && hour < 9)) {
            return 'Domingo 9:00 AM';
        }
        // Próximo viernes
        else {
            return 'Viernes 7:30 PM';
        }
    }

    // Mostrar transmisión en vivo
    showLiveStream() {
        const streamPlayer = document.getElementById('streamPlayer');
        const placeholder = document.getElementById('streamPlaceholder');
        const fbVideo = streamPlayer.querySelector('.fb-video');
        
        placeholder.style.display = 'none';
        fbVideo.style.display = 'block';
        
        // Actualizar URL de Facebook Video
        fbVideo.setAttribute('data-href', 
            `https://www.facebook.com/${this.facebookPageId}/videos/`);
        
        // Re-parsear Facebook widgets
        if (window.FB) {
            FB.XFBML.parse(streamPlayer);
        }
    }

    // Mostrar placeholder
    showStreamPlaceholder() {
        const placeholder = document.getElementById('streamPlaceholder');
        const fbVideo = document.querySelector('.fb-video');
        
        placeholder.style.display = 'flex';
        fbVideo.style.display = 'none';
    }

    // Notificar nueva transmisión
    notifyNewLiveStream() {
        // Notificación del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MCM Buga - Transmisión en Vivo', {
                body: '¡Tenemos una transmisión en vivo activa!',
                icon: './assets/images/Logo MCm.png',
                tag: 'live-stream'
            });
        }
        
        // Notificación en la página
        this.showPageNotification('¡Transmisión en vivo activa! 🔴', 'success');
        
        // Tracking analytics
        if (window.analytics) {
            window.analytics.track('live_stream_started');
        }
    }

    // Cargar historial de transmisiones
    async loadStreamHistory() {
        try {
            // Simular datos de transmisiones anteriores
            const mockStreams = this.generateMockStreamHistory();
            
            // En producción, esto sería una llamada a la API de Facebook
            const streams = mockStreams.slice(this.historyOffset, this.historyOffset + this.historyLimit);
            
            this.renderStreamHistory(streams);
            this.historyOffset += streams.length;
            
        } catch (error) {
            console.error('Error loading stream history:', error);
            this.showHistoryError();
        }
    }

    // Generar datos simulados de transmisiones
    generateMockStreamHistory() {
        const streams = [];
        const today = new Date();
        
        for (let i = 1; i <= 20; i++) {
            const streamDate = new Date(today.getTime() - (i * 3.5 * 24 * 60 * 60 * 1000)); // Cada 3.5 días
            const isViernes = streamDate.getDay() === 5;
            
            streams.push({
                id: `stream_${i}`,
                title: isViernes ? 'Culto de Viernes' : 'Culto Dominical',
                description: isViernes ? 
                    'Servicio nocturno de oración y adoración' : 
                    'Servicio dominical de alabanza y predicación',
                date: streamDate,
                duration: '2:15:30',
                views: Math.floor(Math.random() * 500) + 100,
                thumbnail: './assets/images/Pastora.jpg',
                videoUrl: `https://www.facebook.com/${this.facebookPageId}/videos/`,
                highlights: [
                    'Tiempo de adoración',
                    'Predicación de la Pastora Mary',
                    'Tiempo de oración'
                ]
            });
        }
        
        return streams;
    }

    // Renderizar historial de transmisiones
    renderStreamHistory(streams) {
        const historyGrid = document.getElementById('historyGrid');
        
        streams.forEach(stream => {
            const streamCard = this.createStreamCard(stream);
            historyGrid.appendChild(streamCard);
        });
    }

    // Crear tarjeta de transmisión
    createStreamCard(stream) {
        const card = document.createElement('div');
        card.className = 'stream-card';
        card.setAttribute('data-stream-id', stream.id);
        
        const formatDate = (date) => {
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        };
        
        card.innerHTML = `
            <div class="stream-thumbnail">
                <img src="${stream.thumbnail}" alt="${stream.title}" loading="lazy">
                <div class="stream-overlay">
                    <button class="play-btn" onclick="playStream('${stream.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="stream-duration">${stream.duration}</div>
                </div>
                <div class="stream-badge">
                    <i class="fas fa-video"></i>
                    Grabación
                </div>
            </div>
            
            <div class="stream-content">
                <h4 class="stream-title">${stream.title}</h4>
                <p class="stream-description">${stream.description}</p>
                
                <div class="stream-meta">
                    <div class="stream-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(stream.date)}
                    </div>
                    <div class="stream-views">
                        <i class="fas fa-eye"></i>
                        ${stream.views} visualizaciones
                    </div>
                </div>
                
                <div class="stream-highlights">
                    ${stream.highlights.map(highlight => 
                        `<span class="highlight-tag">${highlight}</span>`
                    ).join('')}
                </div>
                
                <div class="stream-actions">
                    <button class="btn btn-primary btn-sm" onclick="playStream('${stream.id}')">
                        <i class="fas fa-play"></i>
                        Reproducir
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="shareStream('${stream.id}')">
                        <i class="fas fa-share"></i>
                        Compartir
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Reproducir transmisión específica
    playStream(streamId) {
        const streamPlayer = document.getElementById('streamPlayer');
        const placeholder = document.getElementById('streamPlaceholder');
        const fbVideo = streamPlayer.querySelector('.fb-video');
        
        // Ocultar placeholder
        placeholder.style.display = 'none';
        fbVideo.style.display = 'block';
        
        // Actualizar URL del video
        fbVideo.setAttribute('data-href', 
            `https://www.facebook.com/${this.facebookPageId}/videos/`);
        
        // Re-parsear Facebook widgets
        if (window.FB) {
            FB.XFBML.parse(streamPlayer);
        }
        
        // Scroll al reproductor
        streamPlayer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('stream_replay_started', { streamId });
        }
    }

    // Compartir transmisión
    shareStream(type, streamId = null) {
        const url = window.location.href.split('#')[0] + '#live-streaming';
        const text = streamId ? 
            'Mira esta transmisión anterior de MCM Buga' : 
            'Únete a las transmisiones en vivo de MCM Buga';
        
        switch (type) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    this.showPageNotification('Enlace copiado al portapapeles', 'success');
                });
                break;
        }
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('stream_shared', { type, streamId });
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Cargar más transmisiones
        document.getElementById('loadMoreStreams')?.addEventListener('click', () => {
            this.loadStreamHistory();
        });
        
        // Ver todas las transmisiones
        document.getElementById('viewAllStreams')?.addEventListener('click', () => {
            window.open(`https://www.facebook.com/${this.facebookPageId}/videos`, '_blank');
        });
        
        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
                this.requestNotificationPermission();
            }, 5000);
        }
    }

    // Solicitar permisos de notificación
    async requestNotificationPermission() {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showPageNotification('Notificaciones activadas para transmisiones en vivo', 'success');
            }
        } catch (error) {
            console.warn('Could not request notification permission:', error);
        }
    }

    // Iniciar verificación periódica
    startPeriodicCheck() {
        // Verificar cada 2 minutos
        this.checkInterval = setInterval(() => {
            this.checkLiveStatus();
        }, 120000);
    }

    // Detener verificación periódica
    stopPeriodicCheck() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    // Mostrar notificación en página
    showPageNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `page-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="close-notification">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Cerrar manualmente
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Manejar errores de transmisión
    handleStreamError() {
        this.showStreamPlaceholder();
        this.showPageNotification('Error al cargar la transmisión. Intenta recargar la página.', 'error');
    }

    // Mostrar error en historial
    showHistoryError() {
        const historyGrid = document.getElementById('historyGrid');
        historyGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No se pudieron cargar las transmisiones anteriores.</p>
                <button class="btn btn-secondary" onclick="liveStreaming.loadStreamHistory()">
                    Intentar de nuevo
                </button>
            </div>
        `;
    }

    // Obtener estadísticas de transmisión
    getStreamingStats() {
        return {
            isLive: this.isLive,
            historyLoaded: this.historyOffset,
            nextCheck: this.checkInterval ? 'Active' : 'Inactive'
        };
    }
}

// Funciones globales para uso en HTML
window.showPreviousStreams = function() {
    const historySection = document.getElementById('streamHistory');
    historySection.scrollIntoView({ behavior: 'smooth' });
    
    if (window.analytics) {
        window.analytics.track('previous_streams_clicked');
    }
};

window.playStream = function(streamId) {
    if (window.liveStreaming) {
        window.liveStreaming.playStream(streamId);
    }
};

window.shareStream = function(type, streamId = null) {
    if (window.liveStreaming) {
        window.liveStreaming.shareStream(type, streamId);
    }
};

// Inicializar cuando el DOM esté listo
let liveStreaming;
document.addEventListener('DOMContentLoaded', () => {
    liveStreaming = new LiveStreaming();
});

// Exponer para uso global
window.LiveStreaming = LiveStreaming;
window.liveStreaming = liveStreaming;