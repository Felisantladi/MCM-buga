// Sistema de Blog/Noticias para MCM Buga
class BlogSystem {
    constructor(options = {}) {
        this.options = {
            postsPerPage: 6,
            categories: ['Todas', 'Predicaciones', 'Eventos', 'Testimonios', 'Anuncios', 'Devocionales'],
            enableComments: false, // Deshabilitado por simplicidad
            enableSearch: true,
            enableTags: true,
            autoSave: true,
            ...options
        };
        
        this.currentPage = 1;
        this.currentCategory = 'Todas';
        this.searchQuery = '';
        this.posts = [];
        this.featuredPosts = [];
        
        this.init();
    }

    async init() {
        console.log('Blog System initialized');
        await this.loadPosts();
        this.createBlogSection();
        this.attachEventListeners();
    }

    // Cargar posts (simulados, en producción vendría de una API/CMS)
    async loadPosts() {
        // Datos simulados de posts
        this.posts = [
            {
                id: 1,
                title: 'Reflexión Dominical: El Poder de la Oración',
                excerpt: 'La oración no cambia las cosas, cambia a las personas y las personas cambian las cosas. Descubre el verdadero poder transformador de la oración en tu vida diaria.',
                content: this.generateFullContent('oración'),
                author: 'Pastora Mary Penagos',
                category: 'Devocionales',
                tags: ['oración', 'fe', 'transformación'],
                date: new Date('2024-01-15'),
                image: './assets/images/Pastora.jpg',
                featured: true,
                readTime: '5 min',
                status: 'published'
            },
            {
                id: 2,
                title: 'Próximo Retiro Espiritual: "Renovación en Su Presencia"',
                excerpt: 'Te invitamos a participar en nuestro retiro espiritual anual. Tres días de renovación, adoración y crecimiento espiritual en un ambiente de paz y comunión.',
                content: this.generateFullContent('retiro'),
                author: 'Equipo MCM',
                category: 'Eventos',
                tags: ['retiro', 'renovación', 'comunidad'],
                date: new Date('2024-01-10'),
                image: './assets/images/Sirviendo.jpg',
                featured: false,
                readTime: '3 min',
                status: 'published'
            },
            {
                id: 3,
                title: 'Testimonio: "Dios Restauró Mi Familia"',
                excerpt: 'María nos comparte cómo la gracia de Dios transformó su hogar. Una historia de restauración, perdón y nuevas oportunidades que inspira y fortalece la fe.',
                content: this.generateFullContent('testimonio'),
                author: 'María González',
                category: 'Testimonios',
                tags: ['testimonio', 'familia', 'restauración'],
                date: new Date('2024-01-05'),
                image: './assets/images/Ministerio de Niños.jpg',
                featured: true,
                readTime: '7 min',
                status: 'published'
            },
            {
                id: 4,
                title: 'Nuevos Horarios de Células para Febrero',
                excerpt: 'A partir del mes de febrero, algunos grupos de células tendrán nuevos horarios. Revisa los cambios y encuentra el grupo que mejor se adapte a tu disponibilidad.',
                content: this.generateFullContent('células'),
                author: 'Coordinación de Células',
                category: 'Anuncios',
                tags: ['células', 'horarios', 'grupos'],
                date: new Date('2024-01-02'),
                image: './assets/images/SERVIcio niños.jpg',
                featured: false,
                readTime: '2 min',
                status: 'published'
            },
            {
                id: 5,
                title: 'Reflexión de Año Nuevo: "Nuevas Misericordias Cada Mañana"',
                excerpt: 'Al iniciar este nuevo año, recordamos que las misericordias de Dios se renuevan cada día. Un mensaje de esperanza y propósito para los días que vienen.',
                content: this.generateFullContent('año nuevo'),
                author: 'Pastora Mary Penagos',
                category: 'Predicaciones',
                tags: ['año nuevo', 'esperanza', 'misericordia'],
                date: new Date('2024-01-01'),
                image: './assets/images/Pastora.jpg',
                featured: false,
                readTime: '6 min',
                status: 'published'
            },
            {
                id: 6,
                title: 'Ministerio de Jóvenes: Actividades de Enero',
                excerpt: 'Conoce todas las actividades que hemos preparado para nuestros jóvenes este mes. Desde estudios bíblicos hasta actividades recreativas y de servicio a la comunidad.',
                content: this.generateFullContent('jóvenes'),
                author: 'Liderazgo Juvenil',
                category: 'Eventos',
                tags: ['jóvenes', 'actividades', 'enero'],
                date: new Date('2023-12-28'),
                image: './assets/images/Ministerio Nuiños 2.jpg',
                featured: false,
                readTime: '4 min',
                status: 'published'
            }
        ];
        
        this.featuredPosts = this.posts.filter(post => post.featured);
    }

    // Generar contenido completo simulado
    generateFullContent(topic) {
        const contents = {
            'oración': `
                <p>La oración es mucho más que una práctica religiosa; es el canal de comunicación directa con nuestro Padre celestial. En estos tiempos de incertidumbre y desafíos, la oración se convierte en nuestro refugio y fortaleza.</p>
                
                <h3>El Poder Transformador</h3>
                <p>Cuando oramos, no solo presentamos nuestras peticiones ante Dios, sino que también abrimos nuestros corazones para ser transformados por Su presencia. La oración cambia nuestra perspectiva, renueva nuestra mente y fortalece nuestro espíritu.</p>
                
                <h3>Una Vida de Oración Constante</h3>
                <p>El apóstol Pablo nos exhorta a "orar sin cesar" (1 Tesalonicenses 5:17). Esto no significa estar en oración literal las 24 horas del día, sino mantener una actitud de dependencia y comunicación constante con Dios en todas nuestras actividades.</p>
                
                <blockquote>
                    "La oración efectiva del justo puede mucho" - Santiago 5:16
                </blockquote>
                
                <p>Te invitamos a profundizar en tu vida de oración. Dedica tiempo cada día para estar en Su presencia, y verás cómo Dios transforma no solo tus circunstancias, sino también tu corazón.</p>
            `,
            'retiro': `
                <p>Nos complace anunciar nuestro retiro espiritual anual "Renovación en Su Presencia", que se llevará a cabo del 15 al 17 de marzo en el Centro de Retiros Valle de Bendición.</p>
                
                <h3>Programa del Retiro</h3>
                <ul>
                    <li><strong>Viernes:</strong> Llegada, cena de bienvenida y servicio de apertura</li>
                    <li><strong>Sábado:</strong> Sesiones de enseñanza, tiempo de adoración y oración personal</li>
                    <li><strong>Domingo:</strong> Servicio de clausura y tiempo de compartir testimonios</li>
                </ul>
                
                <h3>Incluye</h3>
                <p>El retiro incluye hospedaje, todas las comidas, materiales de estudio y actividades recreativas. Tendremos tiempo para la reflexión personal, oración grupal y fortalecimiento de lazos fraternales.</p>
                
                <h3>Inscripciones</h3>
                <p>Las inscripciones están abiertas hasta el 1 de marzo. Los cupos son limitados, por lo que te animamos a inscribirte pronto. Para más información, contacta a la coordinación de eventos.</p>
            `,
            'testimonio': `
                <p><em>Este testimonio fue compartido por María González durante nuestro culto dominical, y con su permiso lo compartimos para edificación de toda la congregación.</em></p>
                
                <p>Hace dos años, mi familia pasaba por una crisis que parecía imposible de superar. Los problemas económicos, las discusiones constantes y la falta de comunicación nos habían llevado al borde del divorcio.</p>
                
                <h3>El Momento Decisivo</h3>
                <p>Fue durante una de nuestras transmisiones en vivo que escuché un mensaje sobre el perdón y la restauración. Esa noche, tomé la decisión de entregar completamente mi matrimonio y mi familia en las manos de Dios.</p>
                
                <h3>El Proceso de Restauración</h3>
                <p>No fue fácil, pero Dios comenzó a obrar en nuestros corazones. Aprendimos a comunicarnos con amor, a perdonar las ofensas y a buscar juntos la voluntad de Dios para nuestra familia.</p>
                
                <blockquote>
                    "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien" - Romanos 8:28
                </blockquote>
                
                <p>Hoy puedo decir con alegría que Dios no solo restauró mi matrimonio, sino que lo hizo más fuerte de lo que jamás fue. Nuestro hogar es ahora un lugar de paz, amor y adoración.</p>
                
                <p>Si estás pasando por dificultades en tu familia, no pierdas la esperanza. Dios es el Dios de los imposibles, y Él puede restaurar lo que parece perdido.</p>
            `,
            'células': `
                <p>Querida congregación, nos complace informarles sobre los nuevos horarios de nuestras células que entrarán en vigencia a partir del 1 de febrero.</p>
                
                <h3>Cambios en los Horarios</h3>
                <p>Después de escuchar sus sugerencias y evaluar las necesidades de la congregación, hemos realizado algunos ajustes en los horarios para facilitar la participación de más hermanos.</p>
                
                <h3>Nuevos Horarios por Zona</h3>
                <ul>
                    <li><strong>Zona Norte:</strong> Martes 7:00 PM (antes Miércoles)</li>
                    <li><strong>Zona Centro:</strong> Miércoles 7:30 PM (sin cambios)</li>
                    <li><strong>Zona Sur:</strong> Jueves 7:00 PM (antes Miércoles)</li>
                    <li><strong>Célula Virtual:</strong> Viernes 8:00 PM (nueva)</li>
                </ul>
                
                <h3>Nueva Célula Virtual</h3>
                <p>Hemos agregado una célula completamente virtual para aquellos hermanos que no pueden asistir presencialmente. Esta se realizará a través de nuestra plataforma de video y tendrá el mismo formato de estudio bíblico y oración.</p>
                
                <p>Para confirmar tu asistencia o cambiar de célula, por favor contacta a tu líder de célula o a la coordinación general.</p>
            `,
            'año nuevo': `
                <p>Al comenzar este nuevo año, nuestros corazones se llenan de gratitud por las bendiciones recibidas y de expectativa por lo que Dios tiene preparado para nosotros.</p>
                
                <h3>Nuevas Misericordias</h3>
                <p>Lamentaciones 3:22-23 nos recuerda que "Por la misericordia de Jehová no hemos sido consumidos, porque nunca decayeron sus misericordias. Nuevas son cada mañana; grande es tu fidelidad."</p>
                
                <h3>Un Tiempo de Reflexión</h3>
                <p>Este es un momento perfecto para reflexionar sobre:</p>
                <ul>
                    <li>Las lecciones aprendidas en el año que pasó</li>
                    <li>Los propósitos de Dios para nuestra vida</li>
                    <li>Las metas espirituales para este nuevo ciclo</li>
                    <li>Nuestro compromiso con el crecimiento en Cristo</li>
                </ul>
                
                <h3>Declaraciones de Fe</h3>
                <p>Este año declaramos:</p>
                <blockquote>
                    "Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis." - Jeremías 29:11
                </blockquote>
                
                <p>Que este nuevo año sea de crecimiento espiritual, bendiciones abundantes y un acercamiento más profundo a nuestro Señor Jesucristo.</p>
            `,
            'jóvenes': `
                <p>¡Qué emoción tenemos al compartir con ustedes todas las actividades que hemos preparado para nuestros jóvenes durante este mes de enero!</p>
                
                <h3>Estudios Bíblicos Semanales</h3>
                <p>Cada sábado a las 6:00 PM continuaremos con nuestra serie "Jóvenes con Propósito", donde exploramos cómo vivir una vida que honre a Dios en medio de los desafíos de la juventud moderna.</p>
                
                <h3>Actividades Especiales</h3>
                <ul>
                    <li><strong>7 de Enero:</strong> Tarde de juegos y pizza</li>
                    <li><strong>14 de Enero:</strong> Servicio comunitario en el hogar de ancianos</li>
                    <li><strong>21 de Enero:</strong> Noche de talentos y adoración</li>
                    <li><strong>28 de Enero:</strong> Retiro de un día en la naturaleza</li>
                </ul>
                
                <h3>Proyecto del Mes</h3>
                <p>Este mes estaremos recolectando útiles escolares para donar a niños de escasos recursos. Es una oportunidad maravillosa para poner en práctica el amor de Cristo sirviendo a nuestra comunidad.</p>
                
                <h3>Únete a Nosotros</h3>
                <p>Si eres joven entre 15 y 25 años, te invitamos cordialmente a ser parte de nuestro ministerio juvenil. ¡Ven y descubre el plan maravilloso que Dios tiene para tu vida!</p>
            `
        };
        
        return contents[topic] || '<p>Contenido en desarrollo...</p>';
    }

    // Crear la sección del blog en el HTML
    createBlogSection() {
        const blogSection = document.createElement('section');
        blogSection.id = 'blog';
        blogSection.className = 'section blog';
        blogSection.setAttribute('aria-labelledby', 'blog-title');
        
        blogSection.innerHTML = `
            <div class="container">
                <h2 id="blog-title" class="section-title reveal">Noticias y Reflexiones</h2>
                <p class="section-subtitle reveal">Mantente al día con las últimas noticias, reflexiones y eventos de nuestra comunidad de fe.</p>
                
                <!-- Posts destacados -->
                <div class="featured-posts" id="featuredPosts">
                    <h3>Destacados</h3>
                    <div class="featured-grid">
                        ${this.renderFeaturedPosts()}
                    </div>
                </div>
                
                <!-- Filtros y búsqueda -->
                <div class="blog-controls">
                    <div class="blog-categories">
                        ${this.options.categories.map(category => `
                            <button class="category-btn ${category === this.currentCategory ? 'active' : ''}" 
                                    data-category="${category}">
                                ${category}
                            </button>
                        `).join('')}
                    </div>
                    
                    ${this.options.enableSearch ? `
                        <div class="blog-search">
                            <input type="text" 
                                   id="blogSearch" 
                                   placeholder="Buscar en noticias..." 
                                   value="${this.searchQuery}">
                            <button class="search-btn" id="searchBtn">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Lista de posts -->
                <div class="blog-posts" id="blogPosts">
                    ${this.renderPosts()}
                </div>
                
                <!-- Paginación -->
                <div class="blog-pagination" id="blogPagination">
                    ${this.renderPagination()}
                </div>
                
                <!-- Newsletter subscription -->
                <div class="newsletter-signup">
                    <div class="newsletter-content">
                        <h3>Recibe nuestras noticias</h3>
                        <p>Suscríbete para recibir las últimas noticias y reflexiones directamente en tu correo.</p>
                        <form class="newsletter-form" id="newsletterForm">
                            <input type="email" placeholder="Tu correo electrónico" required>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-envelope"></i>
                                Suscribirse
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar después de la sección de música
        const musicSection = document.getElementById('music');
        if (musicSection) {
            musicSection.parentNode.insertBefore(blogSection, musicSection.nextSibling);
        } else {
            // Si no encuentra la sección de música, insertarlo antes de contacto
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.parentNode.insertBefore(blogSection, contactSection);
            }
        }
    }

    // Renderizar posts destacados
    renderFeaturedPosts() {
        return this.featuredPosts.slice(0, 2).map(post => `
            <article class="featured-post" data-post-id="${post.id}">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="post-category">${post.category}</div>
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span class="post-author">
                            <i class="fas fa-user"></i>
                            ${post.author}
                        </span>
                        <span class="post-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(post.date)}
                        </span>
                        <span class="post-read-time">
                            <i class="fas fa-clock"></i>
                            ${post.readTime}
                        </span>
                    </div>
                    <button class="btn btn-primary read-more-btn" onclick="blogSystem.showFullPost(${post.id})">
                        Leer más
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `).join('');
    }

    // Renderizar posts normales
    renderPosts() {
        const filteredPosts = this.getFilteredPosts();
        const startIndex = (this.currentPage - 1) * this.options.postsPerPage;
        const endIndex = startIndex + this.options.postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);
        
        if (postsToShow.length === 0) {
            return `
                <div class="no-posts">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron noticias</h3>
                    <p>Intenta con otros términos de búsqueda o categoría.</p>
                </div>
            `;
        }
        
        return postsToShow.map(post => `
            <article class="blog-post" data-post-id="${post.id}">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}" loading="lazy">
                    <div class="post-category">${post.category}</div>
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <span class="post-author">
                            <i class="fas fa-user"></i>
                            ${post.author}
                        </span>
                        <span class="post-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(post.date)}
                        </span>
                        <span class="post-read-time">
                            <i class="fas fa-clock"></i>
                            ${post.readTime}
                        </span>
                    </div>
                    ${this.options.enableTags ? `
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <button class="btn btn-outline read-more-btn" onclick="blogSystem.showFullPost(${post.id})">
                        Leer más
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </article>
        `).join('');
    }

    // Obtener posts filtrados
    getFilteredPosts() {
        let filtered = this.posts.filter(post => post.status === 'published');
        
        // Filtrar por categoría
        if (this.currentCategory !== 'Todas') {
            filtered = filtered.filter(post => post.category === this.currentCategory);
        }
        
        // Filtrar por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Ordenar por fecha (más recientes primero)
        return filtered.sort((a, b) => b.date - a.date);
    }

    // Renderizar paginación
    renderPagination() {
        const filteredPosts = this.getFilteredPosts();
        const totalPages = Math.ceil(filteredPosts.length / this.options.postsPerPage);
        
        if (totalPages <= 1) return '';
        
        let pagination = '';
        
        // Botón anterior
        if (this.currentPage > 1) {
            pagination += `
                <button class="pagination-btn" onclick="blogSystem.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-left"></i>
                    Anterior
                </button>
            `;
        }
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                pagination += `<span class="pagination-current">${i}</span>`;
            } else {
                pagination += `<button class="pagination-btn" onclick="blogSystem.goToPage(${i})">${i}</button>`;
            }
        }
        
        // Botón siguiente
        if (this.currentPage < totalPages) {
            pagination += `
                <button class="pagination-btn" onclick="blogSystem.goToPage(${this.currentPage + 1})">
                    Siguiente
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        return pagination;
    }

    // Formatear fecha
    formatDate(date) {
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Adjuntar event listeners
    attachEventListeners() {
        // Filtros de categoría
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.updateBlogView();
                this.updateCategoryButtons();
            }
        });
        
        // Búsqueda
        const searchInput = document.getElementById('blogSearch');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput && searchBtn) {
            const performSearch = () => {
                this.searchQuery = searchInput.value.trim();
                this.currentPage = 1;
                this.updateBlogView();
            };
            
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
        
        // Newsletter
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSignup(e.target);
            });
        }
    }

    // Actualizar vista del blog
    updateBlogView() {
        const blogPosts = document.getElementById('blogPosts');
        const blogPagination = document.getElementById('blogPagination');
        
        if (blogPosts) {
            blogPosts.innerHTML = this.renderPosts();
        }
        
        if (blogPagination) {
            blogPagination.innerHTML = this.renderPagination();
        }
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('blog_filter_applied', {
                category: this.currentCategory,
                searchQuery: this.searchQuery,
                page: this.currentPage
            });
        }
    }

    // Actualizar botones de categoría
    updateCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });
    }

    // Ir a página específica
    goToPage(page) {
        this.currentPage = page;
        this.updateBlogView();
        
        // Scroll al inicio de la sección
        document.getElementById('blog').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Mostrar post completo
    showFullPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        // Crear modal para mostrar el post completo
        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content post-content-full">
                <div class="modal-header">
                    <button class="close-btn" onclick="this.closest('.post-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <article class="full-post">
                    <header class="post-header">
                        <div class="post-category">${post.category}</div>
                        <h1 class="post-title">${post.title}</h1>
                        <div class="post-meta">
                            <span class="post-author">
                                <i class="fas fa-user"></i>
                                ${post.author}
                            </span>
                            <span class="post-date">
                                <i class="fas fa-calendar"></i>
                                ${this.formatDate(post.date)}
                            </span>
                            <span class="post-read-time">
                                <i class="fas fa-clock"></i>
                                ${post.readTime}
                            </span>
                        </div>
                        ${this.options.enableTags ? `
                            <div class="post-tags">
                                ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </header>
                    
                    <div class="post-image-full">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    
                    <div class="post-body">
                        ${post.content}
                    </div>
                    
                    <footer class="post-footer">
                        <div class="post-share">
                            <h4>Compartir este artículo</h4>
                            <div class="share-buttons">
                                <button class="share-btn" onclick="blogSystem.sharePost(${post.id}, 'whatsapp')">
                                    <i class="fab fa-whatsapp"></i>
                                    WhatsApp
                                </button>
                                <button class="share-btn" onclick="blogSystem.sharePost(${post.id}, 'facebook')">
                                    <i class="fab fa-facebook-f"></i>
                                    Facebook
                                </button>
                                <button class="share-btn" onclick="blogSystem.sharePost(${post.id}, 'copy')">
                                    <i class="fas fa-copy"></i>
                                    Copiar enlace
                                </button>
                            </div>
                        </div>
                    </footer>
                </article>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Cerrar modal al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = 'auto';
            }
        });
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('blog_post_viewed', {
                postId: post.id,
                postTitle: post.title,
                category: post.category
            });
        }
    }

    // Compartir post
    sharePost(postId, platform) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const url = `${window.location.origin}${window.location.pathname}#blog-post-${postId}`;
        const text = `${post.title} - ${post.excerpt.substring(0, 100)}...`;
        
        switch (platform) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url).then(() => {
                    this.showNotification('Enlace copiado al portapapeles');
                });
                break;
        }
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('blog_post_shared', {
                postId: post.id,
                platform: platform
            });
        }
    }

    // Manejar suscripción al newsletter
    handleNewsletterSignup(form) {
        const email = form.querySelector('input[type="email"]').value;
        
        // Simular suscripción (en producción se enviaría a un servicio real)
        console.log('Newsletter signup:', email);
        
        this.showNotification('¡Gracias por suscribirte! Recibirás nuestras noticias pronto.');
        form.reset();
        
        // Tracking
        if (window.analytics) {
            window.analytics.track('newsletter_signup', { email: 'hidden_for_privacy' });
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `blog-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // API pública para agregar posts
    addPost(postData) {
        const post = {
            id: Date.now(),
            date: new Date(),
            status: 'published',
            featured: false,
            readTime: '5 min',
            ...postData
        };
        
        this.posts.unshift(post);
        this.updateBlogView();
        return post.id;
    }

    // Obtener estadísticas del blog
    getBlogStats() {
        return {
            totalPosts: this.posts.length,
            featuredPosts: this.featuredPosts.length,
            categories: this.options.categories.length,
            currentPage: this.currentPage,
            currentCategory: this.currentCategory,
            searchQuery: this.searchQuery
        };
    }
}

// Inicializar cuando el DOM esté listo
let blogSystem;
document.addEventListener('DOMContentLoaded', () => {
    blogSystem = new BlogSystem();
});

// Exponer para uso global
window.BlogSystem = BlogSystem;
window.blogSystem = blogSystem;