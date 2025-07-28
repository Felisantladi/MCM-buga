// Configuración de seguridad para la página web
class SecurityConfig {
    static generateNonce() {
        // Generar un nonce único para cada carga de página
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static setupCSP() {
        // Content Security Policy básico
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = `
            default-src 'self';
            script-src 'self' 'nonce-${this.generateNonce()}' https://connect.facebook.net;
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
            font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
            img-src 'self' data: https: blob:;
            media-src 'self' https:;
            connect-src 'self' https://www.facebook.com;
            frame-src https://www.facebook.com;
        `.replace(/\s+/g, ' ').trim();
        document.head.appendChild(meta);
    }

    static sanitizeInput(input) {
        // Sanitizar entrada de usuario
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static addSecureAttributes() {
        // Agregar atributos de seguridad a enlaces externos
        document.querySelectorAll('a[target="_blank"]').forEach(link => {
            link.setAttribute('rel', 'noopener noreferrer');
        });
    }
}

// Inicializar configuración de seguridad
document.addEventListener('DOMContentLoaded', () => {
    SecurityConfig.setupCSP();
    SecurityConfig.addSecureAttributes();
});
