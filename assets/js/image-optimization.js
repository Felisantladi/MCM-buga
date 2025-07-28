// Sistema de Optimización de Imágenes Automática
class ImageOptimizer {
    constructor() {
        this.lazyImages = [];
        this.imageObserver = null;
        this.supportsWebP = false;
        this.supportsAVIF = false;
        this.init();
    }

    async init() {
        // Detectar soporte de formatos modernos
        await this.detectFormatSupport();
        
        // Configurar Intersection Observer para lazy loading
        this.setupLazyLoading();
        
        // Optimizar imágenes existentes
        this.optimizeExistingImages();
        
        // Configurar resize automático
        this.setupResponsiveImages();
        
        console.log('Image Optimizer initialized');
        console.log('WebP support:', this.supportsWebP);
        console.log('AVIF support:', this.supportsAVIF);
    }

    // Detectar soporte de formatos de imagen modernos
    async detectFormatSupport() {
        // Detectar WebP
        this.supportsWebP = await this.checkWebPSupport();
        
        // Detectar AVIF
        this.supportsAVIF = await this.checkAVIFSupport();
    }

    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    checkAVIFSupport() {
        return new Promise((resolve) => {
            const avif = new Image();
            avif.onload = avif.onerror = () => {
                resolve(avif.height === 2);
            };
            // Usar un AVIF de prueba válido pero pequeño
            avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
        });
    }

    // Configurar lazy loading con Intersection Observer
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            this.observeImages();
        } else {
            // Fallback para navegadores sin soporte
            this.loadAllImages();
        }
    }

    // Observar todas las imágenes para lazy loading
    observeImages() {
        const images = document.querySelectorAll('img[data-src], img[data-srcset]');
        images.forEach(img => {
            this.lazyImages.push(img);
            this.imageObserver.observe(img);
        });
    }

    // Cargar imagen individual
    async loadImage(img) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            
            tempImg.onload = () => {
                // Aplicar la imagen optimizada
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
                
                img.classList.add('loaded');
                img.classList.remove('loading');
                resolve(img);
            };

            tempImg.onerror = () => {
                // Fallback: intentar cargar imagen original
                this.loadImageWithFallback(img).then(resolve).catch(() => {
                    img.classList.add('error');
                    img.classList.remove('loading');
                    // Mostrar imagen placeholder si falla todo
                    img.src = this.generatePlaceholder(img.dataset.width || 300, img.dataset.height || 200);
                    resolve(img);
                });
            };

            img.classList.add('loading');
            
            // Cargar la imagen más optimizada disponible
            const optimizedSrc = this.getOptimizedImageSrc(img.dataset.src || img.src);
            tempImg.src = optimizedSrc;
        });
    }

    // Cargar imagen con fallback
    async loadImageWithFallback(img) {
        const originalSrc = img.dataset.src || img.src;
        const fallbackSources = [
            originalSrc,
            originalSrc.replace(/\.avif$/i, '.webp'),
            originalSrc.replace(/\.(avif|webp)$/i, '.jpg'),
            originalSrc.replace(/\.(avif|webp)$/i, '.png')
        ];

        for (const src of fallbackSources) {
            try {
                await this.testImageLoad(src);
                img.src = src;
                return Promise.resolve(img);
            } catch (error) {
                console.warn(`Failed to load: ${src}`);
                continue;
            }
        }
        return Promise.reject(new Error('All image sources failed'));
    }

    // Probar carga de imagen
    testImageLoad(src) {
        return new Promise((resolve, reject) => {
            const testImg = new Image();
            testImg.onload = () => resolve(src);
            testImg.onerror = () => reject(new Error(`Failed: ${src}`));
            testImg.src = src;
        });
    }

    // Obtener la fuente de imagen optimizada
    getOptimizedImageSrc(originalSrc) {
        if (!originalSrc) return '';

        // Si el navegador soporta AVIF, intentar cargar versión AVIF
        if (this.supportsAVIF) {
            const avifSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
            return avifSrc;
        }
        
        // Si el navegador soporta WebP, intentar cargar versión WebP
        if (this.supportsWebP) {
            const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
            return webpSrc;
        }

        return originalSrc;
    }

    // Optimizar imágenes existentes en el DOM
    optimizeExistingImages() {
        const images = document.querySelectorAll('img:not([data-src])');
        images.forEach(img => {
            if (img.src && !img.dataset.optimized) {
                this.addLazyLoadingToImage(img);
            }
        });
    }

    // Agregar lazy loading a imagen existente
    addLazyLoadingToImage(img) {
        const originalSrc = img.src;
        img.dataset.src = originalSrc;
        img.dataset.optimized = 'true';
        img.src = this.generatePlaceholder(img.width || 300, img.height || 200);
        
        if (this.imageObserver) {
            this.imageObserver.observe(img);
        }
    }

    // Generar placeholder SVG
    generatePlaceholder(width, height, color = '#f0f0f0') {
        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="${color}"/>
                <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#999" text-anchor="middle" dy="0.3em">
                    Cargando...
                </text>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    // Configurar imágenes responsivas
    setupResponsiveImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.dataset.responsive) {
                this.makeImageResponsive(img);
            }
        });
    }

    // Hacer imagen responsiva
    makeImageResponsive(img) {
        const container = img.parentElement;
        const containerWidth = container.offsetWidth;
        
        // Determinar tamaños apropiados
        const sizes = this.calculateImageSizes(containerWidth);
        
        if (!img.dataset.srcset && img.src) {
            img.dataset.responsive = 'true';
            
            // Generar srcset basado en el tamaño del contenedor
            const srcset = sizes.map(size => 
                `${this.generateResizedImageUrl(img.src, size)} ${size}w`
            ).join(', ');
            
            img.dataset.srcset = srcset;
            img.sizes = this.generateSizesAttribute(containerWidth);
        }
    }

    // Calcular tamaños de imagen necesarios
    calculateImageSizes(containerWidth) {
        const breakpoints = [320, 480, 768, 1024, 1200, 1600];
        return breakpoints.filter(size => size <= containerWidth * 2);
    }

    // Generar URL de imagen redimensionada (simulado)
    generateResizedImageUrl(originalUrl, width) {
        // En un entorno real, esto se conectaría a un servicio de redimensionamiento
        // Por ahora, devolvemos la URL original
        return originalUrl;
    }

    // Generar atributo sizes
    generateSizesAttribute(containerWidth) {
        if (containerWidth <= 480) return '100vw';
        if (containerWidth <= 768) return '50vw';
        return '33vw';
    }

    // Cargar todas las imágenes (fallback)
    loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => this.loadImage(img));
    }

    // Precargar imagen crítica
    preloadImage(src, priority = 'high') {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = this.getOptimizedImageSrc(src);
            
            if (priority === 'high') {
                link.fetchPriority = 'high';
            }

            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to preload: ${src}`));
            
            document.head.appendChild(link);
        });
    }

    // Comprimir imagen en cliente (para uploads futuros)
    async compressImage(file, quality = 0.8, maxWidth = 1920, maxHeight = 1080) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calcular nuevas dimensiones
                let { width, height } = this.calculateCompressedDimensions(
                    img.width, img.height, maxWidth, maxHeight
                );

                canvas.width = width;
                canvas.height = height;

                // Dibujar imagen redimensionada
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a blob
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    // Calcular dimensiones comprimidas
    calculateCompressedDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
        let width = originalWidth;
        let height = originalHeight;

        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    // Obtener estadísticas de rendimiento
    getPerformanceStats() {
        const loadedImages = document.querySelectorAll('img.loaded').length;
        const totalImages = document.querySelectorAll('img').length;
        const errorImages = document.querySelectorAll('img.error').length;

        return {
            totalImages,
            loadedImages,
            errorImages,
            loadingProgress: (loadedImages / totalImages) * 100,
            webpSupport: this.supportsWebP,
            avifSupport: this.supportsAVIF
        };
    }

    // Limpiar observers (para SPA)
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        this.lazyImages = [];
    }
}

// Inicializar optimizador cuando el DOM esté listo
let imageOptimizer;

document.addEventListener('DOMContentLoaded', () => {
    imageOptimizer = new ImageOptimizer();
});

// Exponer para uso global
window.ImageOptimizer = ImageOptimizer;
window.imageOptimizer = imageOptimizer;