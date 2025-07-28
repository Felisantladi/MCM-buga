// Configuración de seguridad mejorada para la página web
class SecurityManager {
    constructor() {
        this.nonce = this.generateNonce();
        this.csrfToken = this.generateCSRFToken();
        this.allowedDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdnjs.cloudflare.com',
            'connect.facebook.net',
            'www.facebook.com'
        ];
        this.init();
    }

    init() {
        this.setupCSP();
        this.addSecureAttributes();
        this.setupFormSecurity();
        this.setupClickjackingProtection();
        this.monitorSecurity();
    }

    // Generar nonce criptográficamente seguro
    generateNonce() {
        if (!window.crypto || !window.crypto.getRandomValues) {
            console.warn('Crypto API no disponible, usando fallback');
            return this.fallbackNonce();
        }
        
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Fallback para navegadores sin crypto API
    fallbackNonce() {
        return Math.random().toString(36).substring(2) + 
               Date.now().toString(36) +
               Math.random().toString(36).substring(2);
    }

    // Generar token CSRF
    generateCSRFToken() {
        const timestamp = Date.now().toString();
        const randomString = this.generateNonce();
        return btoa(timestamp + ':' + randomString);
    }

    // Configurar Content Security Policy
    setupCSP() {
        if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            return; // CSP ya configurado
        }

        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = this.buildCSPContent();
        document.head.appendChild(meta);
    }

    buildCSPContent() {
        return [
            "default-src 'self'",
            `script-src 'self' 'nonce-${this.nonce}' https://connect.facebook.net`,
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
            "img-src 'self' data: https: blob:",
            "media-src 'self' https:",
            "connect-src 'self' https://www.facebook.com https://graph.facebook.com",
            "frame-src https://www.facebook.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'"
        ].join('; ');
    }

    // Agregar atributos de seguridad a enlaces
    addSecureAttributes() {
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Verificar si el enlace es a dominio externo
            if (this.isExternalLink(link.href)) {
                link.addEventListener('click', this.handleExternalLink.bind(this));
            }
        });
    }

    isExternalLink(url) {
        try {
            const linkDomain = new URL(url).hostname;
            const currentDomain = window.location.hostname;
            return linkDomain !== currentDomain && 
                   !this.allowedDomains.includes(linkDomain);
        } catch (e) {
            return false;
        }
    }

    handleExternalLink(event) {
        const confirmed = confirm('¿Estás seguro de que quieres visitar este enlace externo?');
        if (!confirmed) {
            event.preventDefault();
        }
    }

    // Configurar seguridad de formularios
    setupFormSecurity() {
        document.querySelectorAll('form').forEach(form => {
            // Agregar token CSRF
            this.addCSRFToken(form);
            
            // Configurar validación
            form.addEventListener('submit', this.validateForm.bind(this));
            
            // Configurar campos de entrada
            form.querySelectorAll('input, textarea').forEach(field => {
                field.addEventListener('input', this.sanitizeInput.bind(this));
            });
        });
    }

    addCSRFToken(form) {
        const existingToken = form.querySelector('input[name="csrf_token"]');
        if (existingToken) return;

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'csrf_token';
        tokenInput.value = this.csrfToken;
        form.appendChild(tokenInput);
    }

    validateForm(event) {
        const form = event.target;
        let isValid = true;

        // Verificar CSRF token
        const csrfToken = form.querySelector('input[name="csrf_token"]');
        if (!csrfToken || csrfToken.value !== this.csrfToken) {
            console.error('Token CSRF inválido');
            isValid = false;
        }

        // Validar campos requeridos
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'Este campo es requerido');
                isValid = false;
            }
        });

        // Validar emails
        form.querySelectorAll('input[type="email"]').forEach(field => {
            if (field.value && !this.validateEmail(field.value)) {
                this.showFieldError(field, 'Email inválido');
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault();
        }

        return isValid;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    }

    // Sanitizar entrada de usuario
    sanitizeInput(event) {
        const field = event.target;
        const originalValue = field.value;
        
        // Remover caracteres peligrosos
        let sanitizedValue = originalValue
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');

        // Limpiar errores si el campo ahora es válido
        if (sanitizedValue !== originalValue) {
            field.value = sanitizedValue;
        }

        const formGroup = field.closest('.form-group');
        if (formGroup && formGroup.classList.contains('error')) {
            if (field.checkValidity()) {
                formGroup.classList.remove('error');
                const errorElement = formGroup.querySelector('.error-message');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        }
    }

    // Validar formato de email
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    // Protección contra clickjacking
    setupClickjackingProtection() {
        if (window !== window.top) {
            console.warn('Página cargada en iframe, verificando origen');
            
            // Permitir solo iframes de dominios confiables
            const allowedParents = ['localhost', window.location.hostname];
            const parentHostname = document.referrer ? new URL(document.referrer).hostname : null;
            
            if (parentHostname && !allowedParents.includes(parentHostname)) {
                window.top.location = window.location;
            }
        }
    }

    // Monitorear actividad sospechosa
    monitorSecurity() {
        // Detectar intentos de XSS
        this.setupXSSDetection();
        
        // Monitorear cambios en el DOM
        this.setupDOMMonitoring();
        
        // Detectar extensiones maliciosas
        this.detectSuspiciousExtensions();
    }

    setupXSSDetection() {
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);
            
            if (tagName.toLowerCase() === 'script') {
                console.warn('Intento de crear elemento script detectado');
            }
            
            return element;
        };
    }

    setupDOMMonitoring() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Verificar scripts sospechosos
                        if (node.tagName === 'SCRIPT' && !node.hasAttribute('nonce')) {
                            console.warn('Script sin nonce detectado:', node);
                        }
                        
                        // Verificar iframes sospechosos
                        if (node.tagName === 'IFRAME') {
                            const src = node.getAttribute('src');
                            if (src && !this.isAllowedDomain(src)) {
                                console.warn('Iframe sospechoso detectado:', src);
                                node.remove();
                            }
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    isAllowedDomain(url) {
        try {
            const urlDomain = new URL(url).hostname;
            return this.allowedDomains.includes(urlDomain) || 
                   urlDomain === window.location.hostname;
        } catch (e) {
            return false;
        }
    }

    detectSuspiciousExtensions() {
        // Detectar modificaciones sospechosas en el DOM
        const checkInterval = setInterval(() => {
            const suspiciousElements = document.querySelectorAll('[data-extension-id], [data-adblock]');
            if (suspiciousElements.length > 0) {
                console.log('Extensiones detectadas, monitoreando comportamiento');
            }
        }, 5000);

        // Limpiar después de 30 segundos
        setTimeout(() => clearInterval(checkInterval), 30000);
    }

    // Método público para obtener el nonce actual
    getNonce() {
        return this.nonce;
    }

    // Método público para obtener el token CSRF
    getCSRFToken() {
        return this.csrfToken;
    }

    // Método público para validar entrada
    static sanitizeString(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Método público para escapar HTML
    static escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Inicializar gestor de seguridad
document.addEventListener('DOMContentLoaded', () => {
    window.securityManager = new SecurityManager();
    
    // Exponer métodos útiles globalmente
    window.SecurityConfig = {
        generateNonce: () => window.securityManager.generateNonce(),
        validateEmail: (email) => window.securityManager.validateEmail(email),
        sanitizeInput: (input) => SecurityManager.sanitizeString(input),
        escapeHTML: (input) => SecurityManager.escapeHTML(input),
        addSecureAttributes: () => window.securityManager.addSecureAttributes()
    };
});

// Configurar nonce para scripts dinámicos
document.addEventListener('DOMContentLoaded', () => {
    const fbScript = document.querySelector('script[data-nonce="auto"]');
    if (fbScript && window.securityManager) {
        fbScript.setAttribute('nonce', window.securityManager.getNonce());
    }
});
