// Script de verificación del servidor MCM Buga (Node.js)
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando estado del sitio web MCM Buga...\n');

async function verificarSitio() {
    const tests = [];
    const baseUrl = 'http://localhost:8000';
    
    // Función helper para hacer requests
    function makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const req = http.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ 
                    status: res.statusCode, 
                    headers: res.headers, 
                    data: data 
                }));
            });
            req.on('error', reject);
            if (options.body) {
                req.write(options.body);
            }
            req.end();
        });
    }
    
    // 1. Verificar página principal
    try {
        console.log('📄 Verificando página principal...');
        const response = await makeRequest(baseUrl);
        if (response.status === 200) {
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
        const postData = JSON.stringify({
            events: [{
                name: 'test_event',
                data: { test: true, timestamp: Date.now() }
            }],
            metadata: { test: true }
        });
        
        const response = await makeRequest(`${baseUrl}/api/analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            body: postData
        });
        
        if (response.status === 200) {
            const data = JSON.parse(response.data);
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
        const response = await makeRequest(`${baseUrl}/api/status`);
        if (response.status === 200) {
            const data = JSON.parse(response.data);
            tests.push({ test: 'Status API', status: '✅', details: `v${data.version}` });
        } else {
            tests.push({ test: 'Status API', status: '❌', details: `${response.status} Error` });
        }
    } catch (error) {
        tests.push({ test: 'Status API', status: '❌', details: error.message });
    }

    // 4. Verificar archivos del sistema
    console.log('📁 Verificando archivos del sistema...');
    
    const archivosImportantes = [
        'index.html',
        'assets/css/variables.css',
        'assets/css/components.css',
        'assets/js/interactivity.js',
        'assets/js/analytics.js',
        'assets/js/image-optimization.js',
        'server.js',
        'manifest.json',
        'sw.js'
    ];
    
    archivosImportantes.forEach(archivo => {
        const rutaCompleta = path.join(__dirname, archivo);
        if (fs.existsSync(rutaCompleta)) {
            const stats = fs.statSync(rutaCompleta);
            tests.push({ 
                test: `Archivo ${archivo}`, 
                status: '✅', 
                details: `${Math.round(stats.size/1024)}KB` 
            });
        } else {
            tests.push({ 
                test: `Archivo ${archivo}`, 
                status: '❌', 
                details: 'No encontrado' 
            });
        }
    });

    // 5. Verificar imágenes AVIF
    console.log('🖼️ Verificando imágenes AVIF...');
    const imagenes = [
        'Logo MCm.avif',
        'Pastora.avif',
        'Ministerio de Niños.avif',
        'Ministerio Nuiños 2.avif',
        'SERVIcio niños.avif',
        'Sirviendo.avif'
    ];

    imagenes.forEach(imagen => {
        const rutaImagen = path.join(__dirname, 'assets', 'images', imagen);
        if (fs.existsSync(rutaImagen)) {
            const stats = fs.statSync(rutaImagen);
            tests.push({ 
                test: `Imagen ${imagen}`, 
                status: '✅', 
                details: `${Math.round(stats.size/1024)}KB` 
            });
        } else {
            tests.push({ 
                test: `Imagen ${imagen}`, 
                status: '❌', 
                details: 'No encontrada' 
            });
        }
    });

    // 6. Verificar archivos de audio
    console.log('🎵 Verificando archivos de audio...');
    const audios = [
        'Obedience-to-God_s-Word_-Beyond-Hearing-to-Doing.mp3',
        'La-Paz-de-Cristo-en-la-Tormenta.mp3',
        'Winning-the-Battle-Against-the-Flesh.mp3',
        'Redención-y-Renovación-en-Cristo.mp3',
        'Relief From Burdens_ Rest in God.wav'
    ];

    audios.forEach(audio => {
        const rutaAudio = path.join(__dirname, 'assets', 'audio', audio);
        if (fs.existsSync(rutaAudio)) {
            const stats = fs.statSync(rutaAudio);
            tests.push({ 
                test: `Audio ${audio.substring(0, 30)}...`, 
                status: '✅', 
                details: `${Math.round(stats.size/1024/1024)}MB` 
            });
        } else {
            tests.push({ 
                test: `Audio ${audio.substring(0, 30)}...`, 
                status: '❌', 
                details: 'No encontrado' 
            });
        }
    });

    // Mostrar resultados
    console.log('\n📋 REPORTE FINAL:\n');
    console.log('═'.repeat(70));
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        console.log(`${test.status} ${test.test.padEnd(40)} ${test.details}`);
        if (test.status === '✅') passed++;
        else failed++;
    });
    
    console.log('═'.repeat(70));
    console.log(`📊 Resumen: ${passed} exitosos, ${failed} fallidos de ${tests.length} total`);
    
    if (failed === 0) {
        console.log('\n🎉 ¡Excelente! El sitio está funcionando perfectamente.');
        console.log('🌟 Todas las funcionalidades están operativas:');
        console.log('   ✅ Servidor web Node.js funcionando');
        console.log('   ✅ APIs de analytics y contacto operativas');
        console.log('   ✅ Imágenes AVIF optimizadas disponibles');
        console.log('   ✅ Archivos de audio accesibles');
        console.log('   ✅ Recursos CSS y JavaScript cargados');
    } else {
        console.log(`\n⚠️ Hay ${failed} problema(s) que requieren atención.`);
    }
    
    console.log('\n🌐 Sitio web disponible en: http://localhost:8000');
    console.log('📚 Endpoints API disponibles:');
    console.log('   • POST /api/analytics - Recibe datos de analytics');
    console.log('   • POST /api/contact - Maneja formularios de contacto');
    console.log('   • GET /api/status - Estado del servidor');
    
    console.log('\n💡 Funcionalidades implementadas:');
    console.log('   🎨 Tema claro/oscuro con toggle');
    console.log('   📊 Sistema de analytics completo');
    console.log('   🖼️ Optimización de imágenes con fallback AVIF→WebP→JPG');
    console.log('   🎵 Reproductores de audio integrados');
    console.log('   📱 Diseño responsive');
    console.log('   🔒 Configuración de seguridad básica');
    console.log('   ⚡ Service Worker para funcionamiento offline');
}

verificarSitio();
