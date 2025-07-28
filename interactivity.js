// Sistema de interactividad mejorado
class InteractivityManager {
    constructor() {
        this.notifications = [];
        this.lightboxOpen = false;
        this.init();
    }

    init() {
        this.setupFormHandlers();
        this.setupLightbox();
        this.setupNotifications();
        this.setupThemeToggle();
        this.setupSmoothScrolling();
        this.setupLoadingStates();
    }

    // Sistema de notificaciones
    setupNotifications() {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.getElementById('notification-container').appendChild(notification);
        
        // Auto-remove notification
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    // Manejo mejorado de formularios
    setupFormHandlers() {
        const contactForm = document.querySelector('.contact-form form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Validación
        if (!this.validateForm(data)) {
            return;
        }

        // Simular envío (reemplazar con implementación real)
        this.simulateFormSubmission(data);
    }

    validateForm(data) {
        let isValid = true;

        // Validar nombre
        if (!data.name || data.name.trim().length < 2) {
            this.showNotification('Por favor ingresa un nombre válido', 'error');
            isValid = false;
        }

        // Validar email
        if (!SecurityConfig.validateEmail(data.email)) {
            this.showNotification('Por favor ingresa un email válido', 'error');
            isValid = false;
        }

        // Validar mensaje
        if (!data.message || data.message.trim().length < 10) {
            this.showNotification('El mensaje debe tener al menos 10 caracteres', 'error');
            isValid = false;
        }

        return isValid;
    }

    simulateFormSubmission(data) {
        const submitBtn = document.querySelector('.contact-form button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Estado de carga
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Simular delay
        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            
            this.showNotification('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
            
            // Limpiar formulario
            document.querySelector('.contact-form form').reset();
        }, 2000);
    }

    // Lightbox para galería
    setupLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', this.openLightbox.bind(this));
        });

        // Crear estructura del lightbox
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-caption"></div>
                <div class="lightbox-nav">
                    <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);

        // Event listeners para lightbox
        lightbox.querySelector('.lightbox-close').addEventListener('click', this.closeLightbox.bind(this));
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });
    }

    openLightbox(e) {
        const img = e.currentTarget.querySelector('img');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        caption.textContent = img.alt;

        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        this.lightboxOpen = true;
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
        this.lightboxOpen = false;
    }

    // Toggle tema oscuro/claro
    setupThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Cambiar tema';
        
        document.body.appendChild(themeToggle);

        themeToggle.addEventListener('click', this.toggleTheme.bind(this));

        // Cargar tema guardado
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.setDarkTheme();
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (body.classList.contains('dark-theme')) {
            this.setLightTheme();
        } else {
            this.setDarkTheme();
        }
    }

    setDarkTheme() {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }

    setLightTheme() {
        document.body.classList.remove('dark-theme');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }

    // Scroll suave mejorado
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Actualizar URL sin recargar
                    history.pushState(null, null, this.getAttribute('href'));
                }
            });
        });
    }

    // Estados de carga
    setupLoadingStates() {
        // Lazy loading para imágenes
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Inicializar sistema de interactividad
document.addEventListener('DOMContentLoaded', () => {
    window.interactivityManager = new InteractivityManager();
});
