// Test Suite para MCM Buga Website
// Este script verifica todas las funcionalidades principales

class MCMTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0
        };
        this.init();
    }

    init() {
        console.log('🧪 Iniciando Test Suite para MCM Buga...');
        this.runAllTests();
    }

    log(type, test, message, details = '') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            type,
            test,
            message,
            details,
            timestamp
        };

        console.log(`[${timestamp}] ${this.getIcon(type)} ${test}: ${message}`);
        if (details) console.log(`   📋 ${details}`);

        this.tests.push(logEntry);
        this.results[type]++;
    }

    getIcon(type) {
        const icons = {
            passed: '✅',
            failed: '❌',
            warning: '⚠️'
        };
        return icons[type] || '📝';
    }

    // Test 1: Verificar estructura HTML
    testHTMLStructure() {
        console.group('🏗️ Testing HTML Structure');
        
        // Verificar elementos críticos
        const criticalElements = [
            { selector: 'header.header', name: 'Header principal' },
            { selector: 'main#main-content', name: 'Contenido principal' },
            { selector: 'footer.footer', name: 'Footer' },
            { selector: '.hero', name: 'Sección hero' },
            { selector: '#messages', name: 'Sección mensajes' },
            { selector: '#contact', name: 'Sección contacto' }
        ];

        let foundElements = 0;
        criticalElements.forEach(element => {
            const found = document.querySelector(element.selector);
            if (found) {
                foundElements++;
                console.log(`✅ ${element.name} encontrado`);
            } else {
                console.log(`❌ ${element.name} no encontrado`);
            }
        });

        if (foundElements === criticalElements.length) {
            this.log('passed', 'Estructura HTML', 'Todos los elementos críticos encontrados', `${foundElements}/${criticalElements.length} elementos`);
        } else {
            this.log('warning', 'Estructura HTML', 'Algunos elementos no encontrados', `${foundElements}/${criticalElements.length} elementos encontrados`);
        }

        console.groupEnd();
    }

    // Test 2: Verificar funcionalidad del tema
    testThemeToggle() {
        console.group('🌙 Testing Theme Toggle');
        
        try {
            const themeButton = document.getElementById('theme-toggle');
            if (!themeButton) {
                this.log('failed', 'Toggle Tema', 'Botón de tema no encontrado', 'Verificar que existe #theme-toggle');
                console.groupEnd();
                return;
            }

            const initialTheme = document.body.classList.contains('dark-theme');
            console.log(`🎨 Tema inicial: ${initialTheme ? 'Oscuro' : 'Claro'}`);

            // Simular evento de click
            const clickEvent = new Event('click');
            themeButton.dispatchEvent(clickEvent);

            setTimeout(() => {
                const newTheme = document.body.classList.contains('dark-theme');
                console.log(`🎨 Tema después del click: ${newTheme ? 'Oscuro' : 'Claro'}`);

                if (newTheme !== initialTheme) {
                    this.log('passed', 'Toggle Tema', 'Cambio de tema funcional', `Cambió de ${initialTheme ? 'oscuro' : 'claro'} a ${newTheme ? 'oscuro' : 'claro'}`);
                } else {
                    this.log('failed', 'Toggle Tema', 'Cambio de tema no funciona', 'El tema no cambió después del evento');
                }
            }, 200);

        } catch (error) {
            this.log('failed', 'Toggle Tema', 'Error en test de tema', error.message);
        }

        console.groupEnd();
    }

    // Test 3: Verificar expansión de detalles
    testDetailsExpansion() {
        console.group('📖 Testing Details Expansion');
        
        const detailsButtons = document.querySelectorAll('.toggle-details');
        console.log(`🔍 Encontrados ${detailsButtons.length} botones de detalles`);

        if (detailsButtons.length === 0) {
            this.log('warning', 'Expansión Detalles', 'No se encontraron botones de detalles', 'No hay elementos .toggle-details');
            console.groupEnd();
            return;
        }

        let workingButtons = 0;
        detailsButtons.forEach((button, index) => {
            try {
                const cardBody = button.closest('.card-body') || button.closest('.culto-item');
                if (!cardBody) {
                    console.log(`❌ Botón ${index + 1}: No se encontró contenedor padre`);
                    return;
                }

                const details = cardBody.querySelector('.details');
                if (!details) {
                    console.log(`❌ Botón ${index + 1}: No se encontró elemento .details`);
                    return;
                }

                const initialDisplay = window.getComputedStyle(details).display;
                
                // Simular click
                const clickEvent = new Event('click');
                button.dispatchEvent(clickEvent);

                setTimeout(() => {
                    const newDisplay = window.getComputedStyle(details).display;
                    if (newDisplay !== initialDisplay) {
                        console.log(`✅ Botón ${index + 1}: Funcional (${initialDisplay} → ${newDisplay})`);
                        workingButtons++;
                    } else {
                        console.log(`❌ Botón ${index + 1}: No cambió (${initialDisplay})`);
                    }

                    if (index === detailsButtons.length - 1) {
                        // Último botón, evaluar resultado
                        if (workingButtons === detailsButtons.length) {
                            this.log('passed', 'Expansión Detalles', 'Todos los botones funcionan', `${workingButtons}/${detailsButtons.length} botones funcionales`);
                        } else if (workingButtons > 0) {
                            this.log('warning', 'Expansión Detalles', 'Algunos botones no funcionan', `${workingButtons}/${detailsButtons.length} botones funcionales`);
                        } else {
                            this.log('failed', 'Expansión Detalles', 'Ningún botón funciona', 'Verificar JavaScript de toggleDetails');
                        }
                    }
                }, 100);

            } catch (error) {
                console.log(`❌ Botón ${index + 1}: Error - ${error.message}`);
            }
        });

        console.groupEnd();
    }

    // Test 4: Verificar reproductores de audio
    testAudioPlayers() {
        console.group('🎵 Testing Audio Players');
        
        const audioPlayers = document.querySelectorAll('audio');
        console.log(`🔍 Encontrados ${audioPlayers.length} reproductores de audio`);

        if (audioPlayers.length === 0) {
            this.log('warning', 'Reproductores Audio', 'No se encontraron reproductores', 'No hay elementos <audio>');
            console.groupEnd();
            return;
        }

        let validPlayers = 0;
        audioPlayers.forEach((audio, index) => {
            const sources = audio.querySelectorAll('source');
            const hasControls = audio.hasAttribute('controls');
            const hasPreload = audio.hasAttribute('preload');

            console.log(`🎵 Reproductor ${index + 1}:`);
            console.log(`   📂 Fuentes: ${sources.length}`);
            console.log(`   🎛️ Controles: ${hasControls ? 'Sí' : 'No'}`);
            console.log(`   ⏳ Precarga: ${hasPreload ? audio.getAttribute('preload') : 'No'}`);

            if (sources.length > 0 && hasControls) {
                validPlayers++;
                console.log(`   ✅ Configuración válida`);
            } else {
                console.log(`   ❌ Configuración incompleta`);
            }
        });

        if (validPlayers === audioPlayers.length) {
            this.log('passed', 'Reproductores Audio', 'Todos los reproductores configurados correctamente', `${validPlayers}/${audioPlayers.length} reproductores válidos`);
        } else if (validPlayers > 0) {
            this.log('warning', 'Reproductores Audio', 'Algunos reproductores mal configurados', `${validPlayers}/${audioPlayers.length} reproductores válidos`);
        } else {
            this.log('failed', 'Reproductores Audio', 'Ningún reproductor configurado correctamente', 'Verificar elementos source y atributo controls');
        }

        console.groupEnd();
    }

    // Test 5: Verificar navegación
    testNavigation() {
        console.group('🧭 Testing Navigation');
        
        const navLinks = document.querySelectorAll('a[href^="#"]');
        console.log(`🔍 Encontrados ${navLinks.length} enlaces de navegación interna`);

        if (navLinks.length === 0) {
            this.log('warning', 'Navegación', 'No se encontraron enlaces internos', 'No hay enlaces con href="#"');
            console.groupEnd();
            return;
        }

        let validLinks = 0;
        const brokenLinks = [];

        navLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                validLinks++;
                console.log(`✅ ${href} → Destino encontrado`);
            } else {
                brokenLinks.push(href);
                console.log(`❌ ${href} → Destino no encontrado`);
            }
        });

        if (validLinks === navLinks.length) {
            this.log('passed', 'Navegación', 'Todos los enlaces funcionan', `${validLinks}/${navLinks.length} enlaces válidos`);
        } else if (validLinks > 0) {
            this.log('warning', 'Navegación', 'Algunos enlaces rotos', `${validLinks}/${navLinks.length} enlaces válidos. Rotos: ${brokenLinks.join(', ')}`);
        } else {
            this.log('failed', 'Navegación', 'Todos los enlaces están rotos', `Enlaces rotos: ${brokenLinks.join(', ')}`);
        }

        console.groupEnd();
    }

    // Test 6: Verificar formularios
    testForms() {
        console.group('📝 Testing Forms');
        
        const forms = document.querySelectorAll('form');
        console.log(`🔍 Encontrados ${forms.length} formularios`);

        if (forms.length === 0) {
            this.log('warning', 'Formularios', 'No se encontraron formularios', 'No hay elementos <form>');
            console.groupEnd();
            return;
        }

        let validForms = 0;
        forms.forEach((form, index) => {
            const requiredFields = form.querySelectorAll('[required]');
            const submitButton = form.querySelector('[type="submit"]');
            const hasValidation = form.hasAttribute('novalidate') === false;

            console.log(`📝 Formulario ${index + 1}:`);
            console.log(`   📋 Campos requeridos: ${requiredFields.length}`);
            console.log(`   🔘 Botón submit: ${submitButton ? 'Sí' : 'No'}`);
            console.log(`   ✅ Validación HTML5: ${hasValidation ? 'Activa' : 'Desactivada'}`);

            if (requiredFields.length > 0 && submitButton) {
                validForms++;
                console.log(`   ✅ Configuración válida`);
            } else {
                console.log(`   ❌ Configuración incompleta`);
            }
        });

        if (validForms === forms.length) {
            this.log('passed', 'Formularios', 'Todos los formularios configurados correctamente', `${validForms}/${forms.length} formularios válidos`);
        } else if (validForms > 0) {
            this.log('warning', 'Formularios', 'Algunos formularios mal configurados', `${validForms}/${forms.length} formularios válidos`);
        } else {
            this.log('failed', 'Formularios', 'Ningún formulario configurado correctamente', 'Verificar campos required y botones submit');
        }

        console.groupEnd();
    }

    // Test 7: Verificar responsive design
    testResponsiveDesign() {
        console.group('📱 Testing Responsive Design');
        
        const viewport = document.querySelector('meta[name="viewport"]');
        const mobileToggle = document.querySelector('.mobile-toggle');
        const navMenu = document.querySelector('.nav-menu');

        console.log(`📱 Meta viewport: ${viewport ? 'Configurado' : 'No encontrado'}`);
        console.log(`🔘 Botón menú móvil: ${mobileToggle ? 'Encontrado' : 'No encontrado'}`);
        console.log(`📋 Menú navegación: ${navMenu ? 'Encontrado' : 'No encontrado'}`);

        let score = 0;
        const features = [];

        if (viewport) {
            score++;
            features.push('Meta viewport');
            console.log(`   ✅ Viewport: ${viewport.getAttribute('content')}`);
        }

        if (mobileToggle) {
            score++;
            features.push('Menú móvil');
        }

        if (navMenu) {
            score++;
            features.push('Navegación');
        }

        if (score === 3) {
            this.log('passed', 'Responsive Design', 'Diseño responsive completamente configurado', `Características: ${features.join(', ')}`);
        } else if (score >= 2) {
            this.log('warning', 'Responsive Design', 'Diseño responsive parcialmente configurado', `${score}/3 características implementadas`);
        } else {
            this.log('failed', 'Responsive Design', 'Diseño responsive mal configurado', `Solo ${score}/3 características implementadas`);
        }

        console.groupEnd();
    }

    // Test 8: Verificar accesibilidad básica
    testAccessibility() {
        console.group('♿ Testing Accessibility');
        
        const altTexts = document.querySelectorAll('img[alt]');
        const allImages = document.querySelectorAll('img');
        const ariaLabels = document.querySelectorAll('[aria-label]');
        const skipLink = document.querySelector('a[href="#main-content"]');
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        console.log(`🖼️ Imágenes con alt: ${altTexts.length}/${allImages.length}`);
        console.log(`🏷️ Elementos con aria-label: ${ariaLabels.length}`);
        console.log(`⏭️ Skip link: ${skipLink ? 'Presente' : 'Ausente'}`);
        console.log(`📚 Estructura de headings: ${headings.length} elementos`);

        let score = 0;
        const issues = [];

        // Verificar alt texts
        if (altTexts.length === allImages.length) {
            score++;
        } else {
            issues.push(`${allImages.length - altTexts.length} imágenes sin alt`);
        }

        // Verificar skip link
        if (skipLink) {
            score++;
        } else {
            issues.push('Sin skip link');
        }

        // Verificar estructura de headings
        const h1s = document.querySelectorAll('h1');
        if (h1s.length === 1) {
            score++;
        } else {
            issues.push(`${h1s.length} elementos H1 (debería ser 1)`);
        }

        // Verificar aria-labels
        if (ariaLabels.length > 0) {
            score++;
        } else {
            issues.push('Sin aria-labels');
        }

        if (score === 4) {
            this.log('passed', 'Accesibilidad', 'Accesibilidad básica implementada correctamente', 'Todas las verificaciones pasaron');
        } else if (score >= 2) {
            this.log('warning', 'Accesibilidad', 'Accesibilidad parcial', `${score}/4 características. Problemas: ${issues.join(', ')}`);
        } else {
            this.log('failed', 'Accesibilidad', 'Problemas de accesibilidad', `Solo ${score}/4 características. Problemas: ${issues.join(', ')}`);
        }

        console.groupEnd();
    }

    // Ejecutar todos los tests
    runAllTests() {
        console.log('🚀 Ejecutando batería completa de tests...\n');

        setTimeout(() => this.testHTMLStructure(), 100);
        setTimeout(() => this.testThemeToggle(), 300);
        setTimeout(() => this.testDetailsExpansion(), 500);
        setTimeout(() => this.testAudioPlayers(), 1000);
        setTimeout(() => this.testNavigation(), 1200);
        setTimeout(() => this.testForms(), 1400);
        setTimeout(() => this.testResponsiveDesign(), 1600);
        setTimeout(() => this.testAccessibility(), 1800);
        setTimeout(() => this.generateReport(), 2000);
    }

    // Generar reporte final
    generateReport() {
        console.log('\n📊 REPORTE FINAL DE TESTS');
        console.log('═'.repeat(50));
        console.log(`✅ Tests exitosos: ${this.results.passed}`);
        console.log(`⚠️ Advertencias: ${this.results.warning}`);
        console.log(`❌ Tests fallidos: ${this.results.failed}`);
        console.log(`📈 Total tests: ${this.tests.length}`);
        
        const successRate = ((this.results.passed / this.tests.length) * 100).toFixed(1);
        console.log(`🎯 Tasa de éxito: ${successRate}%`);

        if (successRate >= 90) {
            console.log('🎉 ¡Excelente! El sitio web está funcionando muy bien.');
        } else if (successRate >= 70) {
            console.log('👍 Bien. Hay algunas áreas que necesitan atención.');
        } else {
            console.log('⚠️ Atención requerida. Varios problemas encontrados.');
        }

        console.log('\n📋 RESUMEN DETALLADO:');
        this.tests.forEach(test => {
            console.log(`${this.getIcon(test.type)} ${test.test}: ${test.message}`);
        });

        console.log('\n✅ Test Suite completado.');
        
        // Guardar resultados en localStorage para referencia
        try {
            localStorage.setItem('mcm-test-results', JSON.stringify({
                timestamp: new Date().toISOString(),
                results: this.results,
                tests: this.tests,
                successRate: successRate
            }));
            console.log('💾 Resultados guardados en localStorage');
        } catch (error) {
            console.log('⚠️ No se pudieron guardar los resultados:', error.message);
        }
    }
}

// Auto-ejecutar cuando se carga el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MCMTestSuite();
    });
} else {
    new MCMTestSuite();
}
