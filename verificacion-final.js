// Script para verificar el estado completo del sitio web MCM Buga
console.log('🔍 Verificando estado del sitio web MCM Buga...\n');

async function verificarSitio() {
    const tests = [];
    
    // 1. Verificar carga de página principal
    try {
        console.log('📄 Verificando página principal...');
        const response = await fetch('/');
        if (response.ok) {
            tests.push({ test: 'Página principal', status: '✅', details: `${response.status} OK` });
        } else {
            tests.push({ test: 'Página principal', status: '❌', details: `${response.status} Error` });
        }
    } catch (error) {
        tests.push({ test: 'Página principal', status: '❌', details: error.message });
    }

    // 2. Verificar endpoint de analytics
    try {
        console.log('📊 Verificando endpoint de analytics...');
        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                events: [{
                    name: 'test_event',
                    data: { test: true, timestamp: Date.now() }
                }],
                metadata: { test: true }
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            tests.push({ test: 'Analytics API', status: '✅', details: data.message });
        } else {
            tests.push({ test: 'Analytics API', status: '❌', details: `${response.status} Error` });
        }
    } catch (error) {
        tests.push({ test: 'Analytics API', status: '❌', details: error.message });
    }

    // 3. Verificar endpoint de estado
    try {
        console.log('🟢 Verificando endpoint de estado...');
        const response = await fetch('/api/status');
        if (response.ok) {
            const data = await response.json();
            tests.push({ test: 'Status API', status: '✅', details: `v${data.version}` });
        } else {
            tests.push({ test: 'Status API', status: '❌', details: `${response.status} Error` });
        }
    } catch (error) {
        tests.push({ test: 'Status API', status: '❌', details: error.message });
    }

    // 4. Verificar imágenes AVIF
    const imagenes = [
        'Logo MCm.avif',
        'Pastora.avif',
        'Ministerio de Niños.avif',
        'Ministerio Nuiños 2.avif',
        'SERVIcio niños.avif',
        'Sirviendo.avif'
    ];

    console.log('🖼️ Verificando imágenes AVIF...');
    for (const imagen of imagenes) {
        try {
            const response = await fetch(`/assets/images/${encodeURIComponent(imagen)}`);
            if (response.ok) {
                tests.push({ test: `Imagen ${imagen}`, status: '✅', details: `${Math.round(response.headers.get('content-length')/1024)}KB` });
            } else {
                tests.push({ test: `Imagen ${imagen}`, status: '❌', details: `${response.status} Error` });
            }
        } catch (error) {
            tests.push({ test: `Imagen ${imagen}`, status: '❌', details: error.message });
        }
    }

    // 5. Verificar archivos de audio
    const audios = [
        'Obedience-to-God_s-Word_-Beyond-Hearing-to-Doing.mp3',
        'La-Paz-de-Cristo-en-la-Tormenta.mp3',
        'Winning-the-Battle-Against-the-Flesh.mp3',
        'Redención-y-Renovación-en-Cristo.mp3'
    ];

    console.log('🎵 Verificando archivos de audio...');
    for (const audio of audios) {
        try {
            const response = await fetch(`/assets/audio/${encodeURIComponent(audio)}`, { method: 'HEAD' });
            if (response.ok) {
                tests.push({ test: `Audio ${audio}`, status: '✅', details: `${Math.round(response.headers.get('content-length')/1024/1024)}MB` });
            } else {
                tests.push({ test: `Audio ${audio}`, status: '❌', details: `${response.status} Error` });
            }
        } catch (error) {
            tests.push({ test: `Audio ${audio}`, status: '❌', details: error.message });
        }
    }

    // 6. Verificar funcionalidades JavaScript
    console.log('⚙️ Verificando funcionalidades JavaScript...');
    
    // Theme toggle
    if (typeof toggleTheme === 'function') {
        tests.push({ test: 'Theme Toggle', status: '✅', details: 'Función disponible' });
    } else {
        tests.push({ test: 'Theme Toggle', status: '❌', details: 'Función no encontrada' });
    }

    // Analytics
    if (window.analytics) {
        tests.push({ test: 'Analytics System', status: '✅', details: 'Inicializado correctamente' });
    } else {
        tests.push({ test: 'Analytics System', status: '❌', details: 'No inicializado' });
    }

    // Image optimization
    if (window.imageOptimization) {
        tests.push({ test: 'Image Optimization', status: '✅', details: 'Sistema activo' });
    } else {
        tests.push({ test: 'Image Optimization', status: '❌', details: 'Sistema no encontrado' });
    }

    // Mostrar resultados
    console.log('\n📋 REPORTE FINAL:\n');
    console.log('═'.repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        console.log(`${test.status} ${test.test.padEnd(30)} ${test.details}`);
        if (test.status === '✅') passed++;
        else failed++;
    });
    
    console.log('═'.repeat(60));
    console.log(`📊 Resumen: ${passed} exitosos, ${failed} fallidos de ${tests.length} total`);
    
    if (failed === 0) {
        console.log('🎉 ¡Todos los tests pasaron! El sitio está funcionando perfectamente.');
    } else {
        console.log(`⚠️ Hay ${failed} problema(s) que requieren atención.`);
    }
    
    console.log('\n🌐 Sitio web disponible en: http://localhost:8000');
    console.log('📚 Documentación de APIs:');
    console.log('   • POST /api/analytics - Recibe datos de analytics');
    console.log('   • POST /api/contact - Maneja formularios de contacto');
    console.log('   • GET /api/status - Estado del servidor');
}

// Ejecutar verificación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verificarSitio);
} else {
    verificarSitio();
}
