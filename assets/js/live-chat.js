// Sistema de Chat en Vivo Básico
class LiveChat {
    constructor(options = {}) {
        this.isOpen = false;
        this.messages = [];
        this.userName = localStorage.getItem('chat_username') || '';
        this.options = {
            position: 'bottom-right',
            theme: 'mcm',
            welcomeMessage: '¡Hola! ¿En qué podemos ayudarte?',
            offlineMessage: 'Actualmente no estamos en línea, pero puedes dejarnos un mensaje.',
            autoResponders: true,
            showTypingIndicator: true,
            maxMessages: 50,
            ...options
        };
        
        this.autoResponses = [
            {
                keywords: ['horario', 'hora', 'culto', 'servicio'],
                response: 'Nuestros cultos son:\n• Viernes 7:30 PM\n• Domingos 9:00 AM\n• Células: Miércoles 7:30 PM'
            },
            {
                keywords: ['ubicación', 'dirección', 'donde', 'queda'],
                response: 'Estamos ubicados en:\nCarrera 8 # 13-35, Buga\nValle del Cauca, Colombia'
            },
            {
                keywords: ['contacto', 'teléfono', 'llamar'],
                response: 'Puedes contactarnos en:\n📞 +57 315 3599017\n📧 mcmbuga@gmail.com'
            },
            {
                keywords: ['pastora', 'pastor', 'líder'],
                response: 'Nuestra líder espiritual es la Pastora Mary Penagos, quien guía nuestra comunidad con amor y sabiduría.'
            },
            {
                keywords: ['oración', 'orar', 'intercesión'],
                response: 'Estaremos encantados de orar contigo. Compártenos tu petición y la incluiremos en nuestras oraciones.'
            }
        ];

        this.init();
    }

    init() {
        this.createChatWidget();
        this.attachEventListeners();
        this.loadChatHistory();
        console.log('Live Chat initialized');
    }

    // Crear el widget de chat
    createChatWidget() {
        const chatHTML = `
            <div id="liveChat" class="live-chat ${this.options.position}">
                <!-- Botón flotante -->
                <div id="chatToggle" class="chat-toggle" aria-label="Abrir chat">
                    <div class="chat-icon">
                        <i class="fas fa-comments"></i>
                        <span class="notification-badge" id="unreadBadge" style="display: none;">0</span>
                    </div>
                    <div class="chat-pulse"></div>
                </div>
                
                <!-- Ventana de chat -->
                <div id="chatWindow" class="chat-window" style="display: none;">
                    <div class="chat-header">
                        <div class="chat-title">
                            <div class="chat-avatar">
                                <img src="./assets/images/Logo MCm.png" alt="MCM Buga">
                            </div>
                            <div class="chat-info">
                                <h4>MCM Buga</h4>
                                <span class="chat-status online" id="chatStatus">En línea</span>
                            </div>
                        </div>
                        <div class="chat-actions">
                            <button class="chat-action-btn" id="minimizeChat" aria-label="Minimizar">
                                <i class="fas fa-minus"></i>
                            </button>
                            <button class="chat-action-btn" id="closeChat" aria-label="Cerrar">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="chat-body">
                        <div class="chat-messages" id="chatMessages">
                            <div class="message bot welcome">
                                <div class="message-avatar">
                                    <img src="./assets/images/Logo MCm.png" alt="MCM">
                                </div>
                                <div class="message-content">
                                    <p>${this.options.welcomeMessage}</p>
                                    <span class="message-time">${this.getCurrentTime()}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="typing-indicator" id="typingIndicator" style="display: none;">
                            <div class="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <span class="typing-text">Escribiendo...</span>
                        </div>
                    </div>
                    
                    <div class="chat-footer">
                        <div class="chat-input-container">
                            <input 
                                type="text" 
                                id="chatInput" 
                                placeholder="Escribe tu mensaje..." 
                                maxlength="500"
                                autocomplete="off"
                            >
                            <button id="sendMessage" class="send-btn" aria-label="Enviar mensaje">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        
                        <div class="chat-options">
                            <button class="option-btn" id="requestPrayer">
                                <i class="fas fa-pray"></i>
                                Pedir oración
                            </button>
                            <button class="option-btn" id="askQuestion">
                                <i class="fas fa-question-circle"></i>
                                Hacer pregunta
                            </button>
                        </div>
                        
                        <div class="chat-privacy">
                            <small>Respetamos tu privacidad. Este chat es confidencial.</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Toggle chat
        document.getElementById('chatToggle').addEventListener('click', () => {
            this.toggleChat();
        });

        // Cerrar chat
        document.getElementById('closeChat').addEventListener('click', () => {
            this.closeChat();
        });

        // Minimizar chat
        document.getElementById('minimizeChat').addEventListener('click', () => {
            this.minimizeChat();
        });

        // Enviar mensaje
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter para enviar
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Botones de opciones rápidas
        document.getElementById('requestPrayer').addEventListener('click', () => {
            this.sendQuickMessage('Me gustaría que oraran por mí 🙏');
        });

        document.getElementById('askQuestion').addEventListener('click', () => {
            this.showQuickQuestions();
        });

        // Detectar cuando el usuario está escribiendo
        let typingTimer;
        document.getElementById('chatInput').addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                // Simular respuesta del bot después de un tiempo
                this.simulateTyping();
            }, 1000);
        });
    }

    // Toggle del chat
    toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        const badge = document.getElementById('unreadBadge');
        
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
            badge.style.display = 'none';
            badge.textContent = '0';
        }
    }

    // Abrir chat
    openChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        
        chatWindow.style.display = 'flex';
        chatToggle.classList.add('active');
        this.isOpen = true;
        
        // Enfocar input
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);

        // Animación de entrada
        chatWindow.style.animation = 'chatSlideIn 0.3s ease forwards';
        
        // Cargar nombre de usuario si no existe
        if (!this.userName) {
            this.askForName();
        }
    }

    // Cerrar chat
    closeChat() {
        const chatWindow = document.getElementById('chatWindow');
        const chatToggle = document.getElementById('chatToggle');
        
        chatWindow.style.animation = 'chatSlideOut 0.3s ease forwards';
        
        setTimeout(() => {
            chatWindow.style.display = 'none';
            chatToggle.classList.remove('active');
            this.isOpen = false;
        }, 300);
    }

    // Minimizar chat
    minimizeChat() {
        this.closeChat();
    }

    // Enviar mensaje
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        
        // Limpiar input
        input.value = '';
        
        // Procesar respuesta automática
        this.processAutoResponse(message);
        
        // Guardar en historial
        this.saveChatHistory();
    }

    // Enviar mensaje rápido
    sendQuickMessage(message) {
        this.addMessage(message, 'user');
        this.processAutoResponse(message);
        this.saveChatHistory();
    }

    // Agregar mensaje al chat
    addMessage(content, type, options = {}) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageId = Date.now();
        
        const messageHTML = `
            <div class="message ${type}" data-message-id="${messageId}">
                ${type === 'bot' ? `
                    <div class="message-avatar">
                        <img src="./assets/images/Logo MCm.png" alt="MCM">
                    </div>
                ` : ''}
                <div class="message-content">
                    <p>${this.formatMessage(content)}</p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                    ${options.showOptions ? `
                        <div class="message-options">
                            ${options.options.map(option => `
                                <button class="option-btn" onclick="liveChat.sendQuickMessage('${option}')">${option}</button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        
        // Scroll al final
        this.scrollToBottom();
        
        // Agregar al array de mensajes
        this.messages.push({
            id: messageId,
            content,
            type,
            timestamp: Date.now()
        });
        
        // Limpiar mensajes antiguos
        this.cleanOldMessages();
        
        // Mostrar badge si el chat está cerrado
        if (!this.isOpen && type === 'bot') {
            this.showUnreadBadge();
        }
    }

    // Procesar respuesta automática
    processAutoResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Buscar respuesta automática
        const autoResponse = this.autoResponses.find(response => 
            response.keywords.some(keyword => message.includes(keyword))
        );
        
        if (autoResponse) {
            setTimeout(() => {
                this.addMessage(autoResponse.response, 'bot');
            }, 1000);
        } else {
            // Respuesta genérica
            setTimeout(() => {
                this.addMessage(
                    'Gracias por tu mensaje. Un miembro de nuestro equipo te responderá pronto. Mientras tanto, puedes:\n\n• Revisar nuestros horarios de culto\n• Conocer más sobre nuestra iglesia\n• Solicitar oración',
                    'bot',
                    {
                        showOptions: true,
                        options: ['Ver horarios', 'Conocer más', 'Pedir oración']
                    }
                );
            }, 1500);
        }
    }

    // Simular escritura
    simulateTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        typingIndicator.style.display = 'flex';
        
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 2000);
    }

    // Preguntar por el nombre
    askForName() {
        setTimeout(() => {
            this.addMessage(
                '¿Cómo te gustaría que te llamemos?',
                'bot'
            );
        }, 1000);
    }

    // Mostrar preguntas rápidas
    showQuickQuestions() {
        const questions = [
            '¿Cuáles son los horarios de culto?',
            '¿Dónde están ubicados?',
            '¿Cómo puedo unirme a una célula?',
            '¿Tienen ministerio de jóvenes?',
            '¿Realizan bodas y bautismos?'
        ];
        
        this.addMessage(
            'Aquí tienes algunas preguntas frecuentes:',
            'bot',
            {
                showOptions: true,
                options: questions
            }
        );
    }

    // Formatear mensaje
    formatMessage(message) {
        // Convertir URLs a enlaces
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        message = message.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convertir saltos de línea
        message = message.replace(/\n/g, '<br>');
        
        // Convertir emojis básicos
        const emojiMap = {
            ':)': '😊',
            ':D': '😄',
            ':(': '😢',
            '<3': '❤️',
            ':pray:': '🙏',
            ':church:': '⛪'
        };
        
        Object.keys(emojiMap).forEach(emoji => {
            message = message.replace(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emojiMap[emoji]);
        });
        
        return message;
    }

    // Obtener hora actual
    getCurrentTime() {
        return new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Scroll al final
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Mostrar badge de mensajes no leídos
    showUnreadBadge() {
        const badge = document.getElementById('unreadBadge');
        let count = parseInt(badge.textContent) + 1;
        badge.textContent = count;
        badge.style.display = 'block';
    }

    // Limpiar mensajes antiguos
    cleanOldMessages() {
        if (this.messages.length > this.options.maxMessages) {
            this.messages = this.messages.slice(-this.options.maxMessages);
            
            // Limpiar DOM también
            const messageElements = document.querySelectorAll('.message');
            const excess = messageElements.length - this.options.maxMessages;
            for (let i = 0; i < excess; i++) {
                messageElements[i].remove();
            }
        }
    }

    // Guardar historial del chat
    saveChatHistory() {
        try {
            localStorage.setItem('chat_history', JSON.stringify(this.messages.slice(-10)));
        } catch (error) {
            console.warn('No se pudo guardar el historial del chat:', error);
        }
    }

    // Cargar historial del chat
    loadChatHistory() {
        try {
            const history = localStorage.getItem('chat_history');
            if (history) {
                const messages = JSON.parse(history);
                // Solo cargar los últimos 5 mensajes para no abrumar
                messages.slice(-5).forEach(msg => {
                    if (msg.type === 'user') {
                        this.addMessage(msg.content, msg.type);
                    }
                });
            }
        } catch (error) {
            console.warn('No se pudo cargar el historial del chat:', error);
        }
    }

    // Configurar estado online/offline
    setOnlineStatus(isOnline) {
        const statusElement = document.getElementById('chatStatus');
        const welcomeMessage = isOnline ? this.options.welcomeMessage : this.options.offlineMessage;
        
        if (isOnline) {
            statusElement.textContent = 'En línea';
            statusElement.className = 'chat-status online';
        } else {
            statusElement.textContent = 'Fuera de línea';
            statusElement.className = 'chat-status offline';
        }
    }

    // API para enviar mensaje programático
    sendSystemMessage(message, options = {}) {
        this.addMessage(message, 'bot', options);
    }

    // Limpiar chat
    clearChat() {
        document.getElementById('chatMessages').innerHTML = `
            <div class="message bot welcome">
                <div class="message-avatar">
                    <img src="./assets/images/Logo MCm.png" alt="MCM">
                </div>
                <div class="message-content">
                    <p>${this.options.welcomeMessage}</p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            </div>
        `;
        this.messages = [];
        localStorage.removeItem('chat_history');
    }
}

// Estilos CSS para el chat (se insertarán dinámicamente)
const chatStyles = `
<style>
@keyframes chatSlideIn {
    from {
        opacity: 0;
        transform: translateY(100%) scale(0.8);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes chatSlideOut {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(100%) scale(0.8);
    }
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.1);
    }
}

.live-chat {
    position: fixed;
    z-index: 9999;
    font-family: var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
}

.live-chat.bottom-right {
    bottom: 20px;
    right: 20px;
}

.chat-toggle {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary, #1a3a7a) 0%, var(--primary-dark, #0d1d3a) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    position: relative;
}

.chat-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
}

.chat-toggle.active {
    background: var(--secondary, #d4af37);
}

.chat-icon {
    color: white;
    font-size: 24px;
    position: relative;
}

.notification-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4757;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid white;
}

.chat-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--primary, #1a3a7a);
    opacity: 0.6;
    animation: pulse 2s infinite;
}

.chat-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.chat-header {
    background: linear-gradient(135deg, var(--primary, #1a3a7a) 0%, var(--primary-dark, #0d1d3a) 100%);
    color: white;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.chat-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.chat-avatar img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid white;
}

.chat-info h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.chat-status {
    font-size: 12px;
    opacity: 0.9;
}

.chat-status.online::before {
    content: "●";
    color: #2ed573;
    margin-right: 4px;
}

.chat-status.offline::before {
    content: "●";
    color: #ff4757;
    margin-right: 4px;
}

.chat-actions {
    display: flex;
    gap: 8px;
}

.chat-action-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.chat-action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.chat-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    scroll-behavior: smooth;
}

.message {
    display: flex;
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease;
}

.message.user {
    justify-content: flex-end;
}

.message.user .message-content {
    background: var(--primary, #1a3a7a);
    color: white;
    margin-left: 40px;
}

.message.bot .message-content {
    background: #f8f9fa;
    color: #333;
    margin-right: 40px;
}

.message-avatar img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    margin-right: 8px;
}

.message-content {
    padding: 12px 16px;
    border-radius: 18px;
    max-width: 70%;
    position: relative;
}

.message-content p {
    margin: 0;
    line-height: 1.4;
    word-wrap: break-word;
}

.message-time {
    font-size: 11px;
    opacity: 0.7;
    display: block;
    margin-top: 4px;
}

.message-options {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.typing-indicator {
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
}

.typing-dots {
    display: flex;
    gap: 4px;
}

.typing-dots span {
    width: 6px;
    height: 6px;
    background: #999;
    border-radius: 50%;
    animation: typingDot 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typingDot {
    0%, 80%, 100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}

.chat-footer {
    border-top: 1px solid #eee;
    padding: 16px;
}

.chat-input-container {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.chat-input-container input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    font-size: 14px;
}

.chat-input-container input:focus {
    border-color: var(--primary, #1a3a7a);
}

.send-btn {
    width: 40px;
    height: 40px;
    background: var(--primary, #1a3a7a);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.send-btn:hover {
    background: var(--primary-dark, #0d1d3a);
}

.chat-options {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.option-btn {
    flex: 1;
    padding: 8px 12px;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 12px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.option-btn:hover {
    background: var(--primary, #1a3a7a);
    color: white;
    border-color: var(--primary, #1a3a7a);
}

.chat-privacy {
    text-align: center;
    opacity: 0.7;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Responsive */
@media (max-width: 480px) {
    .chat-window {
        width: calc(100vw - 40px);
        height: 70vh;
        bottom: 80px;
        right: 20px;
        left: 20px;
    }
    
    .live-chat.bottom-right {
        bottom: 20px;
        right: 50%;
        transform: translateX(50%);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', chatStyles);

// Inicializar chat cuando el DOM esté listo
let liveChat;
document.addEventListener('DOMContentLoaded', () => {
    liveChat = new LiveChat();
});

// Exponer para uso global
window.LiveChat = LiveChat;
window.liveChat = liveChat;