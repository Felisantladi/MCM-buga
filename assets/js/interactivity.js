// Sistema de interactividad avanzado
class InteractivityManager {
    constructor() {
        this.notifications = [];
        this.lightboxOpen = false;
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.intersectionObserver = null;
        this.galleryImages = [];
        this.currentImageIndex = 0;
        this.init();
    }

    init() {
        this.setupNotifications();
        this.setupFormHandlers();
        this.setupLightbox();
        this.setupThemeToggle();
        this.setupSmoothScrolling();
        this.setupLazyLoading();
        this.setupScrollAnimations();
        this.setupProgressIndicators();
        this.setupKeyboardNavigation();
        this.setupMobileMenu();
        this.setupHeaderScroll();
        this.setupDetailsToggle();
        this.applyTheme(this.currentTheme);
    }

    // ==================== SISTEMA DE NOTIFICACIONES ====================
    setupNotifications() {
        // Crear contenedor si no existe
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 5000, actions = null) {
        const notification = this.createNotificationElement(message, type, actions);
        const container = document.getElementById('notification-container');
        
        container.appendChild(notification);
        this.notifications.push(notification);

        // Animación de entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        // Auto-remove
        const timeoutId = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Pausar timer en hover
        notification.addEventListener('mouseenter', () => clearTimeout(timeoutId));
        notification.addEventListener('mouseleave', () => {
            setTimeout(() => this.removeNotification(notification), 1000);
        });

        return notification;
    }

    createNotificationElement(message, type, actions) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        notification.style.transition = 'all 0.3s ease';

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        let actionsHTML = '';
        if (actions) {
            actionsHTML = actions.map(action => 
                `<button class="notification-action" data-action="${action.id}">${action.text}</button>`
            ).join('');
        }

        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas ${icons[type] || icons.info}"></i>
                </div>
                <div class="notification-text">${message}</div>
                <div class="notification-actions">${actionsHTML}</div>
                <button class="notification-close" aria-label="Cerrar notificación">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Event listeners
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Acciones personalizadas
        if (actions) {
            notification.querySelectorAll('.notification-action').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const actionId = e.target.getAttribute('data-action');
                    const action = actions.find(a => a.id === actionId);
                    if (action && action.callback) {
                        action.callback();
                    }
                    this.removeNotification(notification);
                });
            });
        }

        return notification;
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300);
    }

    // ==================== MANEJO AVANZADO DE FORMULARIOS ====================
    setupFormHandlers() {
        document.querySelectorAll('form').forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        // Validación en tiempo real
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });

        // Envío del formulario
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Autocompletado inteligente
        this.setupSmartAutocomplete(form);
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        let isValid = true;
        let message = '';

        // Limpiar errores previos
        this.clearFieldError(field);

        // Validar campo requerido
        if (required && !value) {
            isValid = false;
            message = 'Este campo es requerido';
        }
        // Validar email
        else if (type === 'email' && value && !this.validateEmail(value)) {
            isValid = false;
            message = 'Por favor ingresa un email válido';
        }
        // Validar teléfono
        else if (type === 'tel' && value && !this.validatePhone(value)) {
            isValid = false;
            message = 'Por favor ingresa un teléfono válido';
        }
        // Validar longitud mínima
        else if (field.hasAttribute('minlength')) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                message = `Mínimo ${minLength} caracteres`;
            }
        }

        if (!isValid) {
            this.showFieldError(field, message);
        }

        return isValid;
    }

    showFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            let errorElement = formGroup.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.setAttribute('role', 'alert');
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Shake animation
            field.classList.add('animate-shake');
            setTimeout(() => field.classList.remove('animate-shake'), 500);
        }
    }

    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) && email.length <= 254;
    }

    validatePhone(phone) {
        const regex = /^[\+]?[1-9][\d]{0,15}$/;
        return regex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        
        // Validar todos los campos
        let isValid = true;
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Simular envío (reemplazar con implementación real)
        await this.simulateFormSubmission(form);
    }

    async simulateFormSubmission(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Estado de carga
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Aquí iría la lógica real de envío
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            console.log('Datos del formulario:', data);
            
            // Mostrar éxito
            this.showNotification(
                '¡Mensaje enviado con éxito! Te contactaremos pronto.',
                'success',
                6000,
                [{
                    id: 'view_more',
                    text: 'Ver más',
                    callback: () => console.log('Ver más información')
                }]
            );
            
            // Limpiar formulario
            form.reset();
            
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            this.showNotification('Error al enviar el mensaje. Inténtalo de nuevo.', 'error');
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = originalText;
        }
    }

    setupSmartAutocomplete(form) {
        // Detectar campos comunes y sugerir autocompletado
        const emailField = form.querySelector('input[type="email"]');
        if (emailField) {
            emailField.setAttribute('autocomplete', 'email');
        }

        const nameField = form.querySelector('input[name*="name"], input[name*="nombre"]');
        if (nameField) {
            nameField.setAttribute('autocomplete', 'name');
        }

        const phoneField = form.querySelector('input[type="tel"], input[name*="phone"], input[name*="telefono"]');
        if (phoneField) {
            phoneField.setAttribute('autocomplete', 'tel');
        }
    }

    // ==================== LIGHTBOX AVANZADO ====================
    setupLightbox() {
        // Crear estructura del lightbox
        this.createLightboxHTML();
        
        // Configurar imágenes de la galería
        this.setupGalleryImages();
        
        // Event listeners
        this.setupLightboxEvents();
    }

    createLightboxHTML() {
        if (document.getElementById('lightbox')) return;

        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Cerrar galería">
                    <i class="fas fa-times"></i>
                </button>
                <img class="lightbox-image" src="" alt="" loading="lazy">
                <div class="lightbox-caption"></div>
                <div class="lightbox-nav">
                    <button class="lightbox-prev" aria-label="Imagen anterior">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="lightbox-next" aria-label="Imagen siguiente">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="lightbox-counter">
                    <span class="current">1</span> / <span class="total">1</span>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    setupGalleryImages() {
        this.galleryImages = Array.from(document.querySelectorAll('.gallery-item img, .gallery img'));
        
        this.galleryImages.forEach((img, index) => {
            const container = img.closest('.gallery-item') || img.parentElement;
            container.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLightbox(index);
            });
            
            // Agregar cursor pointer
            container.style.cursor = 'pointer';
            
            // Agregar overlay si no existe
            if (!container.querySelector('.gallery-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'gallery-overlay';
                overlay.innerHTML = '<i class="fas fa-search-plus"></i>';
                container.appendChild(overlay);
            }
        });
    }

    setupLightboxEvents() {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        // Cerrar lightbox
        closeBtn.addEventListener('click', () => this.closeLightbox());
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });

        // Navegación
        prevBtn.addEventListener('click', () => this.showPreviousImage());
        nextBtn.addEventListener('click', () => this.showNextImage());

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (!this.lightboxOpen) return;
            
            switch (e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.showPreviousImage();
                    break;
                case 'ArrowRight':
                    this.showNextImage();
                    break;
            }
        });

        // Touch/swipe para móviles
        this.setupTouchNavigation(lightbox);
    }

    setupTouchNavigation(lightbox) {
        let startX = 0;
        let endX = 0;

        lightbox.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        lightbox.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Mínimo 50px de swipe
                if (diff > 0) {
                    this.showNextImage();
                } else {
                    this.showPreviousImage();
                }
            }
        });
    }

    openLightbox(index) {
        this.currentImageIndex = index;
        this.lightboxOpen = true;
        
        const lightbox = document.getElementById('lightbox');
        const img = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');
        const counter = lightbox.querySelector('.lightbox-counter');
        
        // Configurar imagen
        const galleryImg = this.galleryImages[index];
        img.src = galleryImg.src;
        img.alt = galleryImg.alt;
        caption.textContent = galleryImg.alt;
        
        // Actualizar contador
        counter.querySelector('.current').textContent = index + 1;
        counter.querySelector('.total').textContent = this.galleryImages.length;
        
        // Mostrar lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus para accesibilidad
        lightbox.querySelector('.lightbox-close').focus();
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        this.lightboxOpen = false;
    }

    showPreviousImage() {
        this.currentImageIndex = this.currentImageIndex > 0 
            ? this.currentImageIndex - 1 
            : this.galleryImages.length - 1;
        this.updateLightboxImage();
    }

    showNextImage() {
        this.currentImageIndex = this.currentImageIndex < this.galleryImages.length - 1 
            ? this.currentImageIndex + 1 
            : 0;
        this.updateLightboxImage();
    }

    updateLightboxImage() {
        const lightbox = document.getElementById('lightbox');
        const img = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');
        const counter = lightbox.querySelector('.lightbox-counter');
        
        const galleryImg = this.galleryImages[this.currentImageIndex];
        
        // Fade out
        img.style.opacity = '0';
        
        setTimeout(() => {
            img.src = galleryImg.src;
            img.alt = galleryImg.alt;
            caption.textContent = galleryImg.alt;
            counter.querySelector('.current').textContent = this.currentImageIndex + 1;
            
            // Fade in
            img.style.opacity = '1';
        }, 150);
    }

    // ==================== SISTEMA DE TEMAS ====================
    setupThemeToggle() {
        // Crear botón si no existe
        let themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) {
            themeToggle = document.createElement('button');
            themeToggle.id = 'theme-toggle';
            themeToggle.className = 'theme-toggle';
            themeToggle.setAttribute('aria-label', 'Cambiar tema');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            document.body.appendChild(themeToggle);
        }

        themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Apply saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Cambiar a tema claro');
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');

        if (body.classList.contains('dark-theme')) {
            body.classList.remove('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.setAttribute('aria-label', 'Cambiar a tema oscuro');
        } else {
            body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', 'Cambiar a tema claro');
        }

        // Add smooth transition
        body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.setAttribute('aria-label', 'Cambiar a tema claro');
            }
        } else {
            body.classList.remove('dark-theme');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggle.setAttribute('aria-label', 'Cambiar a tema oscuro');
            }
        }
    }

    // ==================== SCROLL SUAVE Y ANIMACIONES ====================
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Cerrar menú móvil si está abierto
                    const navMenu = document.querySelector('.nav-menu');
                    const mobileToggle = document.querySelector('.mobile-toggle');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        if (mobileToggle) {
                            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        }
                    }
                    
                    // Scroll suave
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Actualizar URL
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    setupScrollAnimations() {
        // Observador para animaciones en scroll
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    this.intersectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observar elementos con animación
        document.querySelectorAll('.animate-fade, .reveal').forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    setupLazyLoading() {
        // Lazy loading para imágenes
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.classList.add('loading');
                        img.src = img.dataset.src;
                        
                        img.onload = () => {
                            img.classList.remove('loading', 'lazy');
                            img.classList.add('loaded');
                        };
                        
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    setupProgressIndicators() {
        // Indicador de progreso de scroll
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.querySelector('.scroll-progress-bar').style.width = `${scrolled}%`;
        });
    }

    setupKeyboardNavigation() {
        // Navegación por teclado mejorada
        document.addEventListener('keydown', (e) => {
            // Skip links con Tab
            if (e.key === 'Tab' && !e.shiftKey) {
                const skipLink = document.querySelector('.sr-only[href="#main-content"]');
                if (skipLink && document.activeElement === skipLink) {
                    e.preventDefault();
                    document.querySelector('#main-content').focus();
                }
            }
        });

        // Indicadores visuales para focus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    // ==================== NAVEGACIÓN Y UI DEL SITIO ====================
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                const isActive = navMenu.classList.toggle('active');
                mobileToggle.setAttribute('aria-expanded', String(isActive));
                mobileToggle.innerHTML = isActive
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
            });

            // Cerrar el menú al hacer click en un enlace (mejora UX)
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        mobileToggle.setAttribute('aria-expanded', 'false');
                        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            });
        }
    }

    setupHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        const toggleScrolled = () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };

        // Estado inicial y escucha de scroll
        toggleScrolled();
        window.addEventListener('scroll', toggleScrolled, { passive: true });
    }

    setupDetailsToggle() {
        document.querySelectorAll('.toggle-details').forEach(button => {
            button.addEventListener('click', () => {
                const sermonArticle = button.closest('.sermon-article');
                const details = sermonArticle ? sermonArticle.querySelector('.details') : null;
                const isExpanded = button.getAttribute('aria-expanded') === 'true';

                if (!details) return;

                details.style.display = isExpanded ? 'none' : 'block';
                button.setAttribute('aria-expanded', String(!isExpanded));

                if (!isExpanded) {
                    button.innerHTML = '<i class="fas fa-times"></i> Ocultar Resumen';
                } else {
                    button.innerHTML = '<i class="fas fa-book-open"></i> Leer Resumen Extendido';
                }
            });
        });
    }

    // ==================== MÉTODOS PÚBLICOS ====================
    
    // Método para mostrar notificación desde fuera
    notify(message, type = 'info', duration = 5000) {
        return this.showNotification(message, type, duration);
    }

    // Método para forzar recarga de lazy images
    reloadLazyImages() {
        document.querySelectorAll('img[data-src]').forEach(img => {
            if (this.intersectionObserver) {
                this.intersectionObserver.observe(img);
            }
        });
    }

    // Método para limpiar recursos
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        this.notifications.forEach(notification => {
            notification.remove();
        });
        
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.remove();
        }
    }
}

// Inicializar sistema de interactividad
document.addEventListener('DOMContentLoaded', () => {
    window.interactivityManager = new InteractivityManager();
    
    // Exponer métodos útiles globalmente
    window.showNotification = (message, type, duration) => {
        return window.interactivityManager.notify(message, type, duration);
    };
});

// Cleanup al cerrar página
window.addEventListener('beforeunload', () => {
    if (window.interactivityManager) {
        window.interactivityManager.destroy();
    }
});
