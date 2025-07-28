// Sistema Base de Usuarios para MCM Buga
class UserSystem {
    constructor(options = {}) {
        this.options = {
            enableRegistration: true,
            enableLogin: true,
            enableProfiles: true,
            enablePreferences: true,
            enablePrayerRequests: true,
            sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
            useLocalStorage: true,
            requireEmailVerification: false,
            ...options
        };
        
        this.currentUser = null;
        this.isLoggedIn = false;
        this.userPreferences = {};
        this.sessionStartTime = null;
        
        this.init();
    }

    async init() {
        console.log('User System initialized');
        
        // Verificar sesión existente
        this.checkExistingSession();
        
        // Crear elementos de UI para usuarios
        this.createUserInterface();
        
        // Configurar event listeners
        this.attachEventListeners();
        
        // Configurar verificación periódica de sesión
        this.startSessionCheck();
    }

    // Verificar sesión existente
    checkExistingSession() {
        if (!this.options.useLocalStorage) return;
        
        try {
            const sessionData = localStorage.getItem('mcm_user_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const now = Date.now();
                
                // Verificar si la sesión no ha expirado
                if (session.expires > now) {
                    this.currentUser = session.user;
                    this.userPreferences = session.preferences || {};
                    this.sessionStartTime = session.startTime;
                    this.isLoggedIn = true;
                    
                    this.updateUserInterface();
                    this.loadUserPreferences();
                    
                    console.log('Sesión restaurada para:', this.currentUser.name);
                } else {
                    // Sesión expirada
                    this.logout();
                }
            }
        } catch (error) {
            console.warn('Error checking existing session:', error);
            this.clearSession();
        }
    }

    // Crear interfaz de usuario
    createUserInterface() {
        // Botón de usuario en el header
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const userButton = document.createElement('div');
            userButton.className = 'user-interface';
            userButton.innerHTML = `
                <div class="user-menu" id="userMenu">
                    <button class="user-btn" id="userBtn" aria-label="Menú de usuario">
                        <i class="fas fa-user"></i>
                        <span id="userName">Invitado</span>
                    </button>
                    
                    <div class="user-dropdown" id="userDropdown" style="display: none;">
                        <div class="user-dropdown-content">
                            <!-- Contenido para usuarios no logueados -->
                            <div class="guest-content" id="guestContent">
                                <div class="dropdown-header">
                                    <h4>Bienvenido a MCM Buga</h4>
                                    <p>Inicia sesión para acceder a más funciones</p>
                                </div>
                                <div class="dropdown-actions">
                                    <button class="btn btn-primary btn-sm" onclick="userSystem.showLoginModal()">
                                        <i class="fas fa-sign-in-alt"></i>
                                        Iniciar Sesión
                                    </button>
                                    <button class="btn btn-outline btn-sm" onclick="userSystem.showRegisterModal()">
                                        <i class="fas fa-user-plus"></i>
                                        Registrarse
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Contenido para usuarios logueados -->
                            <div class="user-content" id="userContent" style="display: none;">
                                <div class="dropdown-header">
                                    <div class="user-avatar">
                                        <i class="fas fa-user-circle"></i>
                                    </div>
                                    <div class="user-info">
                                        <h4 id="dropdownUserName">Usuario</h4>
                                        <p id="dropdownUserEmail">email@ejemplo.com</p>
                                    </div>
                                </div>
                                <div class="dropdown-menu">
                                    <a href="#" onclick="userSystem.showProfile()" class="dropdown-item">
                                        <i class="fas fa-user"></i>
                                        Mi Perfil
                                    </a>
                                    <a href="#" onclick="userSystem.showPreferences()" class="dropdown-item">
                                        <i class="fas fa-cog"></i>
                                        Preferencias
                                    </a>
                                    <a href="#" onclick="userSystem.showPrayerRequests()" class="dropdown-item">
                                        <i class="fas fa-pray"></i>
                                        Mis Peticiones
                                    </a>
                                    <div class="dropdown-divider"></div>
                                    <a href="#" onclick="userSystem.logout()" class="dropdown-item logout">
                                        <i class="fas fa-sign-out-alt"></i>
                                        Cerrar Sesión
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            navbar.appendChild(userButton);
        }

        // Modales para login y registro
        this.createAuthModals();
    }

    // Crear modales de autenticación
    createAuthModals() {
        const modalsHTML = `
            <!-- Modal de Login -->
            <div class="auth-modal" id="loginModal" style="display: none;">
                <div class="modal-content auth-content">
                    <div class="modal-header">
                        <h3>Iniciar Sesión</h3>
                        <button class="close-btn" onclick="userSystem.closeAuthModal('loginModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="loginForm" class="auth-form">
                            <div class="form-group">
                                <label for="loginEmail">Correo Electrónico</label>
                                <input type="email" id="loginEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Contraseña</label>
                                <input type="password" id="loginPassword" name="password" required>
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="rememberMe" name="rememberMe">
                                    <span class="checkmark"></span>
                                    Recordar mi sesión
                                </label>
                            </div>
                            <button type="submit" class="btn btn-primary btn-large">
                                <i class="fas fa-sign-in-alt"></i>
                                Iniciar Sesión
                            </button>
                        </form>
                        <div class="auth-links">
                            <a href="#" onclick="userSystem.showForgotPassword()">¿Olvidaste tu contraseña?</a>
                            <p>¿No tienes cuenta? <a href="#" onclick="userSystem.switchToRegister()">Regístrate aquí</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Registro -->
            <div class="auth-modal" id="registerModal" style="display: none;">
                <div class="modal-content auth-content">
                    <div class="modal-header">
                        <h3>Crear Cuenta</h3>
                        <button class="close-btn" onclick="userSystem.closeAuthModal('registerModal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="registerForm" class="auth-form">
                            <div class="form-group">
                                <label for="registerName">Nombre Completo</label>
                                <input type="text" id="registerName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="registerEmail">Correo Electrónico</label>
                                <input type="email" id="registerEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Contraseña</label>
                                <input type="password" id="registerPassword" name="password" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirmar Contraseña</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required>
                            </div>
                            <div class="form-group">
                                <label for="registerPhone">Teléfono (Opcional)</label>
                                <input type="tel" id="registerPhone" name="phone">
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="acceptTerms" name="acceptTerms" required>
                                    <span class="checkmark"></span>
                                    Acepto los términos y condiciones
                                </label>
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="subscribeNewsletter" name="subscribeNewsletter">
                                    <span class="checkmark"></span>
                                    Recibir noticias y actualizaciones
                                </label>
                            </div>
                            <button type="submit" class="btn btn-primary btn-large">
                                <i class="fas fa-user-plus"></i>
                                Crear Cuenta
                            </button>
                        </form>
                        <div class="auth-links">
                            <p>¿Ya tienes cuenta? <a href="#" onclick="userSystem.switchToLogin()">Inicia sesión aquí</a></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal de Perfil -->
            <div class="profile-modal" id="profileModal" style="display: none;">
                <div class="modal-content profile-content">
                    <div class="modal-header">
                        <h3>Mi Perfil</h3>
                        <button class="close-btn" onclick="userSystem.closeProfileModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="profile-sections">
                            <div class="profile-info">
                                <div class="profile-avatar-section">
                                    <div class="profile-avatar">
                                        <i class="fas fa-user-circle"></i>
                                    </div>
                                    <h4 id="profileUserName">Usuario</h4>
                                    <p id="profileMemberSince">Miembro desde: Enero 2024</p>
                                </div>
                                
                                <form id="profileForm" class="profile-form">
                                    <div class="form-group">
                                        <label for="profileName">Nombre Completo</label>
                                        <input type="text" id="profileName" name="name">
                                    </div>
                                    <div class="form-group">
                                        <label for="profileEmail">Correo Electrónico</label>
                                        <input type="email" id="profileEmail" name="email">
                                    </div>
                                    <div class="form-group">
                                        <label for="profilePhone">Teléfono</label>
                                        <input type="tel" id="profilePhone" name="phone">
                                    </div>
                                    <div class="form-group">
                                        <label for="profileBirthdate">Fecha de Nacimiento</label>
                                        <input type="date" id="profileBirthdate" name="birthdate">
                                    </div>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-save"></i>
                                        Guardar Cambios
                                    </button>
                                </form>
                            </div>
                            
                            <div class="profile-stats">
                                <h4>Actividad</h4>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <i class="fas fa-pray"></i>
                                        <div>
                                            <span class="stat-number" id="prayerRequestsCount">0</span>
                                            <span class="stat-label">Peticiones de Oración</span>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <i class="fas fa-calendar-check"></i>
                                        <div>
                                            <span class="stat-number" id="eventsAttended">0</span>
                                            <span class="stat-label">Eventos Asistidos</span>
                                        </div>
                                    </div>
                                    <div class="stat-item">
                                        <i class="fas fa-video"></i>
                                        <div>
                                            <span class="stat-number" id="streamsWatched">0</span>
                                            <span class="stat-label">Transmisiones Vistas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Toggle del menú de usuario
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userBtn && userDropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = userDropdown.style.display === 'block';
                userDropdown.style.display = isOpen ? 'none' : 'block';
            });
            
            // Cerrar dropdown al hacer clic fuera
            document.addEventListener('click', () => {
                userDropdown.style.display = 'none';
            });
            
            userDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Formularios
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const profileForm = document.getElementById('profileForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e.target);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e.target);
            });
        }

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate(e.target);
            });
        }
    }

    // Manejar login
    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('rememberMe');

        try {
            // Simular autenticación (en producción sería una llamada a API)
            const user = await this.authenticateUser(email, password);
            
            if (user) {
                this.currentUser = user;
                this.isLoggedIn = true;
                this.sessionStartTime = Date.now();
                
                // Guardar sesión
                this.saveSession(rememberMe);
                
                // Actualizar UI
                this.updateUserInterface();
                
                // Cerrar modal
                this.closeAuthModal('loginModal');
                
                // Notificación
                this.showNotification(`¡Bienvenido de vuelta, ${user.name}!`, 'success');
                
                // Tracking
                if (window.analytics) {
                    window.analytics.track('user_login', { userId: user.id });
                }
            } else {
                this.showNotification('Credenciales incorrectas', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Error al iniciar sesión', 'error');
        }
    }

    // Simular autenticación
    async authenticateUser(email, password) {
        // En producción, esto sería una llamada a tu API
        const mockUsers = [
            {
                id: 1,
                name: 'María González',
                email: 'maria@ejemplo.com',
                password: '123456', // En producción, estaría hasheada
                phone: '+57 300 123 4567',
                joinDate: '2023-06-15',
                role: 'member'
            },
            {
                id: 2,
                name: 'Juan Pérez',
                email: 'juan@ejemplo.com',
                password: 'password',
                phone: '+57 301 987 6543',
                joinDate: '2023-08-20',
                role: 'member'
            }
        ];

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));

        const user = mockUsers.find(u => u.email === email && u.password === password);
        return user ? { ...user, password: undefined } : null; // No devolver password
    }

    // Manejar registro
    async handleRegister(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            phone: formData.get('phone'),
            acceptTerms: formData.get('acceptTerms'),
            subscribeNewsletter: formData.get('subscribeNewsletter')
        };

        // Validaciones
        if (userData.password !== userData.confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        if (!userData.acceptTerms) {
            this.showNotification('Debes aceptar los términos y condiciones', 'error');
            return;
        }

        try {
            // Simular registro (en producción sería una llamada a API)
            const newUser = await this.registerUser(userData);
            
            if (newUser) {
                this.currentUser = newUser;
                this.isLoggedIn = true;
                this.sessionStartTime = Date.now();
                
                // Guardar sesión
                this.saveSession(true);
                
                // Actualizar UI
                this.updateUserInterface();
                
                // Cerrar modal
                this.closeAuthModal('registerModal');
                
                // Notificación
                this.showNotification(`¡Bienvenido a MCM Buga, ${newUser.name}!`, 'success');
                
                // Tracking
                if (window.analytics) {
                    window.analytics.track('user_register', { userId: newUser.id });
                }
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showNotification('Error al crear la cuenta', 'error');
        }
    }

    // Simular registro
    async registerUser(userData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simular verificar si el email ya existe
        const existingEmails = ['maria@ejemplo.com', 'juan@ejemplo.com'];
        if (existingEmails.includes(userData.email)) {
            throw new Error('Email already exists');
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            joinDate: new Date().toISOString().split('T')[0],
            role: 'member',
            subscribeNewsletter: userData.subscribeNewsletter
        };

        return newUser;
    }

    // Guardar sesión
    saveSession(persistent = false) {
        if (!this.options.useLocalStorage) return;

        const sessionData = {
            user: this.currentUser,
            preferences: this.userPreferences,
            startTime: this.sessionStartTime,
            expires: Date.now() + (persistent ? 30 * 24 * 60 * 60 * 1000 : this.options.sessionTimeout)
        };

        try {
            localStorage.setItem('mcm_user_session', JSON.stringify(sessionData));
        } catch (error) {
            console.warn('Could not save session:', error);
        }
    }

    // Actualizar interfaz de usuario
    updateUserInterface() {
        const userName = document.getElementById('userName');
        const guestContent = document.getElementById('guestContent');
        const userContent = document.getElementById('userContent');
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');

        if (this.isLoggedIn && this.currentUser) {
            // Actualizar nombre en botón
            if (userName) {
                userName.textContent = this.currentUser.name.split(' ')[0]; // Solo primer nombre
            }
            
            // Mostrar contenido de usuario logueado
            if (guestContent) guestContent.style.display = 'none';
            if (userContent) userContent.style.display = 'block';
            
            // Actualizar información en dropdown
            if (dropdownUserName) dropdownUserName.textContent = this.currentUser.name;
            if (dropdownUserEmail) dropdownUserEmail.textContent = this.currentUser.email;
        } else {
            // Mostrar contenido de invitado
            if (userName) userName.textContent = 'Invitado';
            if (guestContent) guestContent.style.display = 'block';
            if (userContent) userContent.style.display = 'none';
        }
    }

    // Cerrar sesión
    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.userPreferences = {};
        this.sessionStartTime = null;
        
        // Limpiar almacenamiento
        this.clearSession();
        
        // Actualizar UI
        this.updateUserInterface();
        
        // Cerrar dropdown
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }
        
        // Notificación
        this.showNotification('Sesión cerrada correctamente', 'info');
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('user_logout');
        }
    }

    // Limpiar sesión
    clearSession() {
        if (this.options.useLocalStorage) {
            localStorage.removeItem('mcm_user_session');
        }
    }

    // Mostrar modales
    showLoginModal() {
        document.getElementById('loginModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    showRegisterModal() {
        document.getElementById('registerModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    showProfile() {
        if (!this.isLoggedIn) {
            this.showLoginModal();
            return;
        }
        
        // Cargar datos del perfil
        this.loadProfileData();
        document.getElementById('profileModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Cerrar dropdown
        document.getElementById('userDropdown').style.display = 'none';
    }

    // Cerrar modales
    closeAuthModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    closeProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Cambiar entre login y registro
    switchToRegister() {
        this.closeAuthModal('loginModal');
        this.showRegisterModal();
    }

    switchToLogin() {
        this.closeAuthModal('registerModal');
        this.showLoginModal();
    }

    // Cargar datos del perfil
    loadProfileData() {
        if (!this.currentUser) return;

        document.getElementById('profileUserName').textContent = this.currentUser.name;
        document.getElementById('profileMemberSince').textContent = 
            `Miembro desde: ${new Date(this.currentUser.joinDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
        
        document.getElementById('profileName').value = this.currentUser.name || '';
        document.getElementById('profileEmail').value = this.currentUser.email || '';
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        document.getElementById('profileBirthdate').value = this.currentUser.birthdate || '';
        
        // Cargar estadísticas simuladas
        document.getElementById('prayerRequestsCount').textContent = this.currentUser.stats?.prayerRequests || 0;
        document.getElementById('eventsAttended').textContent = this.currentUser.stats?.eventsAttended || 0;
        document.getElementById('streamsWatched').textContent = this.currentUser.stats?.streamsWatched || 0;
    }

    // Manejar actualización de perfil
    async handleProfileUpdate(form) {
        const formData = new FormData(form);
        const updatedData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            birthdate: formData.get('birthdate')
        };

        try {
            // Simular actualización (en producción sería una llamada a API)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Actualizar datos del usuario actual
            Object.assign(this.currentUser, updatedData);
            
            // Guardar sesión actualizada
            this.saveSession(true);
            
            // Actualizar UI
            this.updateUserInterface();
            
            // Notificación
            this.showNotification('Perfil actualizado correctamente', 'success');
            
            // Tracking
            if (window.analytics) {
                window.analytics.track('profile_updated', { userId: this.currentUser.id });
            }
        } catch (error) {
            console.error('Profile update error:', error);
            this.showNotification('Error al actualizar el perfil', 'error');
        }
    }

    // Cargar preferencias de usuario
    loadUserPreferences() {
        if (!this.isLoggedIn) return;

        // Aplicar preferencias guardadas
        if (this.userPreferences.theme) {
            document.body.classList.toggle('dark-theme', this.userPreferences.theme === 'dark');
        }
        
        if (this.userPreferences.notifications) {
            // Configurar notificaciones según preferencias
        }
    }

    // Verificación periódica de sesión
    startSessionCheck() {
        setInterval(() => {
            if (this.isLoggedIn && this.sessionStartTime) {
                const sessionDuration = Date.now() - this.sessionStartTime;
                if (sessionDuration > this.options.sessionTimeout) {
                    this.showNotification('Tu sesión ha expirado', 'warning');
                    this.logout();
                }
            }
        }, 60000); // Verificar cada minuto
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `user-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="close-notification">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
        
        // Cerrar manualmente
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Métodos para funciones futuras
    showPreferences() {
        this.showNotification('Preferencias - Función en desarrollo', 'info');
    }

    showPrayerRequests() {
        this.showNotification('Peticiones de Oración - Función en desarrollo', 'info');
    }

    showForgotPassword() {
        this.showNotification('Recuperar Contraseña - Función en desarrollo', 'info');
    }

    // API pública
    getCurrentUser() {
        return this.currentUser;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    getUserStats() {
        return {
            isLoggedIn: this.isLoggedIn,
            currentUser: this.currentUser?.name || 'Invitado',
            sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
            hasPreferences: Object.keys(this.userPreferences).length > 0
        };
    }
}

// Inicializar cuando el DOM esté listo
let userSystem;
document.addEventListener('DOMContentLoaded', () => {
    userSystem = new UserSystem();
});

// Exponer para uso global
window.UserSystem = UserSystem;
window.userSystem = userSystem;