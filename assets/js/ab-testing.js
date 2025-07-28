// Sistema de A/B Testing Básico para MCM Buga
class ABTesting {
    constructor(options = {}) {
        this.options = {
            enableTesting: true,
            enableAnalytics: true,
            enableLocalStorage: true,
            testDuration: 7 * 24 * 60 * 60 * 1000, // 7 días por defecto
            sampleSize: 0.5, // 50% de usuarios por defecto
            ...options
        };
        
        this.userId = this.generateUserId();
        this.activeTests = [];
        this.userAssignments = {};
        this.testResults = {};
        
        this.init();
    }

    async init() {
        if (!this.options.enableTesting) {
            console.log('A/B Testing disabled');
            return;
        }
        
        console.log('A/B Testing initialized');
        
        // Cargar configuración existente
        this.loadUserAssignments();
        
        // Configurar tests por defecto
        this.setupDefaultTests();
        
        // Ejecutar tests activos
        this.executeActiveTests();
        
        // Configurar tracking de conversiones
        this.setupConversionTracking();
    }

    // Generar ID único para el usuario
    generateUserId() {
        let userId = null;
        
        if (this.options.enableLocalStorage) {
            userId = localStorage.getItem('ab_test_user_id');
        }
        
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            if (this.options.enableLocalStorage) {
                localStorage.setItem('ab_test_user_id', userId);
            }
        }
        
        return userId;
    }

    // Cargar asignaciones de usuario existentes
    loadUserAssignments() {
        if (!this.options.enableLocalStorage) return;
        
        try {
            const stored = localStorage.getItem('ab_test_assignments');
            if (stored) {
                this.userAssignments = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Error loading A/B test assignments:', error);
        }
    }

    // Guardar asignaciones de usuario
    saveUserAssignments() {
        if (!this.options.enableLocalStorage) return;
        
        try {
            localStorage.setItem('ab_test_assignments', JSON.stringify(this.userAssignments));
        } catch (error) {
            console.warn('Error saving A/B test assignments:', error);
        }
    }

    // Configurar tests por defecto
    setupDefaultTests() {
        // Test 1: Colores del botón CTA principal
        this.createTest({
            id: 'cta_button_color',
            name: 'Color del Botón Principal',
            description: 'Probar diferentes colores para el botón de "Conoce Más"',
            variants: [
                {
                    id: 'control',
                    name: 'Control (Azul)',
                    weight: 0.5,
                    changes: {
                        selector: '.hero-cta .btn-primary',
                        styles: {
                            background: 'var(--primary)',
                            borderColor: 'var(--primary)'
                        }
                    }
                },
                {
                    id: 'variant_orange',
                    name: 'Naranja',
                    weight: 0.5,
                    changes: {
                        selector: '.hero-cta .btn-primary',
                        styles: {
                            background: '#ff6b35',
                            borderColor: '#ff6b35'
                        }
                    }
                }
            ],
            conversionGoals: ['hero_cta_click', 'contact_form_submit'],
            startDate: new Date(),
            endDate: new Date(Date.now() + this.options.testDuration),
            active: true
        });

        // Test 2: Texto del botón de transmisión en vivo
        this.createTest({
            id: 'live_button_text',
            name: 'Texto Botón Transmisión',
            description: 'Probar diferentes textos para el botón de transmisión en vivo',
            variants: [
                {
                    id: 'control',
                    name: 'Control (Ver transmisiones anteriores)',
                    weight: 0.5,
                    changes: {
                        selector: '#streamPlaceholder .btn',
                        content: {
                            text: 'Ver transmisiones anteriores'
                        }
                    }
                },
                {
                    id: 'variant_join',
                    name: 'Variante (Únete en vivo)',
                    weight: 0.5,
                    changes: {
                        selector: '#streamPlaceholder .btn',
                        content: {
                            text: 'Únete a nuestros cultos en vivo'
                        }
                    }
                }
            ],
            conversionGoals: ['stream_interaction', 'live_stream_click'],
            startDate: new Date(),
            endDate: new Date(Date.now() + this.options.testDuration),
            active: true
        });

        // Test 3: Posición del chat en vivo
        this.createTest({
            id: 'chat_position',
            name: 'Posición Chat en Vivo',
            description: 'Probar diferentes posiciones para el botón de chat',
            variants: [
                {
                    id: 'control',
                    name: 'Control (Derecha)',
                    weight: 0.5,
                    changes: {
                        selector: '.live-chat',
                        styles: {
                            right: '20px',
                            left: 'auto'
                        }
                    }
                },
                {
                    id: 'variant_left',
                    name: 'Variante (Izquierda)',
                    weight: 0.5,
                    changes: {
                        selector: '.live-chat',
                        styles: {
                            left: '20px',
                            right: 'auto'
                        }
                    }
                }
            ],
            conversionGoals: ['chat_opened', 'chat_message_sent'],
            startDate: new Date(),
            endDate: new Date(Date.now() + this.options.testDuration),
            active: true
        });
    }

    // Crear un nuevo test
    createTest(testConfig) {
        const test = {
            id: testConfig.id,
            name: testConfig.name,
            description: testConfig.description || '',
            variants: testConfig.variants || [],
            conversionGoals: testConfig.conversionGoals || [],
            startDate: testConfig.startDate || new Date(),
            endDate: testConfig.endDate || new Date(Date.now() + this.options.testDuration),
            active: testConfig.active !== false,
            sampleSize: testConfig.sampleSize || this.options.sampleSize,
            createdAt: new Date(),
            results: {
                totalParticipants: 0,
                conversions: {},
                variants: {}
            }
        };

        // Inicializar resultados para cada variante
        test.variants.forEach(variant => {
            test.results.variants[variant.id] = {
                participants: 0,
                conversions: {},
                conversionRate: 0
            };
            
            // Inicializar contadores de conversiones
            test.conversionGoals.forEach(goal => {
                test.results.conversions[goal] = 0;
                test.results.variants[variant.id].conversions[goal] = 0;
            });
        });

        this.activeTests.push(test);
        console.log('A/B Test created:', test.name);
        
        return test;
    }

    // Ejecutar tests activos
    executeActiveTests() {
        this.activeTests.forEach(test => {
            if (this.shouldParticipateInTest(test)) {
                const assignedVariant = this.getAssignedVariant(test);
                this.applyVariant(test, assignedVariant);
                this.trackParticipation(test.id, assignedVariant.id);
            }
        });
    }

    // Determinar si el usuario debe participar en el test
    shouldParticipateInTest(test) {
        // Verificar si el test está activo
        if (!test.active) return false;
        
        // Verificar fechas
        const now = new Date();
        if (now < test.startDate || now > test.endDate) return false;
        
        // Verificar sample size
        const userHash = this.hashUserId(this.userId + test.id);
        return userHash < test.sampleSize;
    }

    // Hash simple para consistent assignment
    hashUserId(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) / 2147483647; // Normalize to 0-1
    }

    // Obtener la variante asignada para un test
    getAssignedVariant(test) {
        // Verificar si ya hay una asignación
        if (this.userAssignments[test.id]) {
            const assignedId = this.userAssignments[test.id];
            return test.variants.find(v => v.id === assignedId);
        }

        // Asignar nueva variante basada en pesos
        const userHash = this.hashUserId(this.userId + test.id + 'variant');
        let cumulativeWeight = 0;
        
        for (const variant of test.variants) {
            cumulativeWeight += variant.weight;
            if (userHash <= cumulativeWeight) {
                // Guardar asignación
                this.userAssignments[test.id] = variant.id;
                this.saveUserAssignments();
                return variant;
            }
        }
        
        // Fallback a la primera variante
        const fallback = test.variants[0];
        this.userAssignments[test.id] = fallback.id;
        this.saveUserAssignments();
        return fallback;
    }

    // Aplicar una variante específica
    applyVariant(test, variant) {
        if (!variant.changes) return;

        console.log(`Applying A/B test variant: ${test.name} - ${variant.name}`);

        // Aplicar cambios de estilo
        if (variant.changes.styles) {
            const elements = document.querySelectorAll(variant.changes.selector);
            elements.forEach(element => {
                Object.assign(element.style, variant.changes.styles);
            });
        }

        // Aplicar cambios de contenido
        if (variant.changes.content) {
            const elements = document.querySelectorAll(variant.changes.selector);
            elements.forEach(element => {
                if (variant.changes.content.text) {
                    element.textContent = variant.changes.content.text;
                }
                if (variant.changes.content.html) {
                    element.innerHTML = variant.changes.content.html;
                }
            });
        }

        // Aplicar cambios de atributos
        if (variant.changes.attributes) {
            const elements = document.querySelectorAll(variant.changes.selector);
            elements.forEach(element => {
                Object.entries(variant.changes.attributes).forEach(([attr, value]) => {
                    element.setAttribute(attr, value);
                });
            });
        }

        // Aplicar clases CSS
        if (variant.changes.classes) {
            const elements = document.querySelectorAll(variant.changes.selector);
            elements.forEach(element => {
                if (variant.changes.classes.add) {
                    element.classList.add(...variant.changes.classes.add);
                }
                if (variant.changes.classes.remove) {
                    element.classList.remove(...variant.changes.classes.remove);
                }
            });
        }
    }

    // Configurar tracking de conversiones
    setupConversionTracking() {
        // CTA Hero clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.hero-cta .btn-primary')) {
                this.trackConversion('hero_cta_click');
            }
            
            if (e.target.closest('#streamPlaceholder .btn')) {
                this.trackConversion('stream_interaction');
                this.trackConversion('live_stream_click');
            }
            
            if (e.target.closest('.chat-toggle')) {
                this.trackConversion('chat_opened');
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.closest('#contact form')) {
                this.trackConversion('contact_form_submit');
            }
            
            if (e.target.closest('#newsletterForm')) {
                this.trackConversion('newsletter_signup');
            }
        });

        // Chat interactions
        if (window.liveChat) {
            // Override sendMessage to track conversions
            const originalSendMessage = window.liveChat.sendMessage;
            window.liveChat.sendMessage = (...args) => {
                this.trackConversion('chat_message_sent');
                return originalSendMessage.apply(window.liveChat, args);
            };
        }
    }

    // Rastrear participación en test
    trackParticipation(testId, variantId) {
        const test = this.activeTests.find(t => t.id === testId);
        if (!test) return;

        test.results.totalParticipants++;
        test.results.variants[variantId].participants++;

        this.updateTestResults(test);

        // Analytics
        if (this.options.enableAnalytics && window.analytics) {
            window.analytics.track('ab_test_participation', {
                testId,
                testName: test.name,
                variantId,
                variantName: test.variants.find(v => v.id === variantId)?.name
            });
        }
    }

    // Rastrear conversión
    trackConversion(goalId, value = 1) {
        this.activeTests.forEach(test => {
            if (test.conversionGoals.includes(goalId)) {
                const userVariant = this.userAssignments[test.id];
                if (userVariant) {
                    test.results.conversions[goalId] = (test.results.conversions[goalId] || 0) + value;
                    test.results.variants[userVariant].conversions[goalId] = 
                        (test.results.variants[userVariant].conversions[goalId] || 0) + value;
                    
                    // Recalcular conversion rate
                    this.calculateConversionRates(test);
                    this.updateTestResults(test);

                    console.log(`A/B Test conversion: ${test.name} - ${goalId} - Variant: ${userVariant}`);

                    // Analytics
                    if (this.options.enableAnalytics && window.analytics) {
                        window.analytics.track('ab_test_conversion', {
                            testId: test.id,
                            testName: test.name,
                            variantId: userVariant,
                            goalId,
                            value
                        });
                    }
                }
            }
        });
    }

    // Calcular conversion rates
    calculateConversionRates(test) {
        Object.keys(test.results.variants).forEach(variantId => {
            const variant = test.results.variants[variantId];
            const totalConversions = Object.values(variant.conversions).reduce((sum, count) => sum + count, 0);
            variant.conversionRate = variant.participants > 0 ? (totalConversions / variant.participants) * 100 : 0;
        });
    }

    // Actualizar resultados del test
    updateTestResults(test) {
        this.calculateConversionRates(test);
        
        // Guardar resultados localmente
        if (this.options.enableLocalStorage) {
            try {
                const resultsKey = `ab_test_results_${test.id}`;
                localStorage.setItem(resultsKey, JSON.stringify({
                    testId: test.id,
                    lastUpdated: new Date().toISOString(),
                    results: test.results
                }));
            } catch (error) {
                console.warn('Error saving A/B test results:', error);
            }
        }
    }

    // Obtener resultados de un test específico
    getTestResults(testId) {
        const test = this.activeTests.find(t => t.id === testId);
        if (!test) return null;

        return {
            testId: test.id,
            testName: test.name,
            active: test.active,
            startDate: test.startDate,
            endDate: test.endDate,
            totalParticipants: test.results.totalParticipants,
            variants: Object.entries(test.results.variants).map(([variantId, data]) => {
                const variant = test.variants.find(v => v.id === variantId);
                return {
                    id: variantId,
                    name: variant?.name || variantId,
                    participants: data.participants,
                    conversions: data.conversions,
                    conversionRate: data.conversionRate,
                    share: test.results.totalParticipants > 0 ? 
                        (data.participants / test.results.totalParticipants) * 100 : 0
                };
            })
        };
    }

    // Obtener todos los resultados
    getAllTestResults() {
        return this.activeTests.map(test => this.getTestResults(test.id));
    }

    // Finalizar un test
    endTest(testId) {
        const test = this.activeTests.find(t => t.id === testId);
        if (!test) return false;

        test.active = false;
        test.endDate = new Date();
        
        console.log('A/B Test ended:', test.name);
        
        // Analytics
        if (this.options.enableAnalytics && window.analytics) {
            window.analytics.track('ab_test_ended', {
                testId: test.id,
                testName: test.name,
                results: this.getTestResults(testId)
            });
        }

        return true;
    }

    // Limpiar tests expirados
    cleanupExpiredTests() {
        const now = new Date();
        this.activeTests.forEach(test => {
            if (test.active && now > test.endDate) {
                this.endTest(test.id);
            }
        });
    }

    // Obtener estadísticas generales
    getOverallStats() {
        const totalTests = this.activeTests.length;
        const activeTests = this.activeTests.filter(t => t.active).length;
        const totalParticipants = this.activeTests.reduce((sum, test) => sum + test.results.totalParticipants, 0);
        const totalConversions = this.activeTests.reduce((sum, test) => 
            sum + Object.values(test.results.conversions).reduce((convSum, count) => convSum + count, 0), 0);

        return {
            totalTests,
            activeTests,
            expiredTests: totalTests - activeTests,
            totalParticipants,
            totalConversions,
            userId: this.userId,
            assignments: Object.keys(this.userAssignments).length
        };
    }

    // Forzar asignación a una variante específica (para testing)
    forceVariant(testId, variantId) {
        const test = this.activeTests.find(t => t.id === testId);
        if (!test) {
            console.error('Test not found:', testId);
            return false;
        }

        const variant = test.variants.find(v => v.id === variantId);
        if (!variant) {
            console.error('Variant not found:', variantId);
            return false;
        }

        this.userAssignments[testId] = variantId;
        this.saveUserAssignments();
        this.applyVariant(test, variant);
        
        console.log('Forced variant assignment:', testId, variantId);
        return true;
    }

    // Limpiar todas las asignaciones
    clearAllAssignments() {
        this.userAssignments = {};
        this.saveUserAssignments();
        console.log('All A/B test assignments cleared');
    }
}

// Función para mostrar panel de debug (solo en desarrollo)
function showABTestingDebugPanel() {
    if (!window.abTesting) return;

    const debugPanel = document.createElement('div');
    debugPanel.id = 'ab-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-size: 12px;
        font-family: monospace;
        max-height: 400px;
        overflow-y: auto;
    `;

    const stats = window.abTesting.getOverallStats();
    const results = window.abTesting.getAllTestResults();

    debugPanel.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #1a3a7a;">A/B Testing Debug</h4>
        <p><strong>User ID:</strong> ${stats.userId.substring(0, 20)}...</p>
        <p><strong>Active Tests:</strong> ${stats.activeTests}/${stats.totalTests}</p>
        <p><strong>Assignments:</strong> ${stats.assignments}</p>
        <hr style="margin: 10px 0;">
        ${results.map(result => `
            <div style="margin-bottom: 10px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
                <strong>${result.testName}</strong><br>
                Participants: ${result.totalParticipants}<br>
                ${result.variants.map(variant => 
                    `${variant.name}: ${variant.participants} (${variant.conversionRate.toFixed(1)}%)`
                ).join('<br>')}
            </div>
        `).join('')}
        <button onclick="document.getElementById('ab-debug-panel').remove()" 
                style="background: #1a3a7a; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
            Close
        </button>
    `;

    document.body.appendChild(debugPanel);
}

// Inicializar cuando el DOM esté listo
let abTesting;
document.addEventListener('DOMContentLoaded', () => {
    abTesting = new ABTesting();
    
    // Limpiar tests expirados cada hora
    setInterval(() => {
        abTesting.cleanupExpiredTests();
    }, 60 * 60 * 1000);

    // Exponer función de debug en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
        window.showABTestingDebugPanel = showABTestingDebugPanel;
        console.log('A/B Testing Debug: Type showABTestingDebugPanel() to see test status');
    }
});

// Exponer para uso global
window.ABTesting = ABTesting;
window.abTesting = abTesting;