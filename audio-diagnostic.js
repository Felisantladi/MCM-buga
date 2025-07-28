// Diagnóstico de archivos de audio
console.log('🎵 Iniciando diagnóstico de audio MCM Buga...');

// Lista de archivos de audio esperados
const audioFiles = [
    'assets/audio/La-Paz-de-Cristo-en-la-Tormenta.mp3',
    'assets/audio/Obedience-to-God_s-Word_-Beyond-Hearing-to-Doing.mp3',
    'assets/audio/Winning-the-Battle-Against-the-Flesh.mp3',
    'assets/audio/Alex Osorio Salmista - Aroma a Rey.mp3',
    'assets/audio/Redención-y-Renovación-en-Cristo.mp3'
];

// Función para probar carga de audio
function testAudioFile(src) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        const timeout = setTimeout(() => {
            reject(new Error(`Timeout loading ${src}`));
        }, 15000); // 15 segundos timeout

        audio.onloadeddata = () => {
            clearTimeout(timeout);
            resolve({
                src: src,
                duration: audio.duration,
                status: 'success'
            });
        };

        audio.onerror = (e) => {
            clearTimeout(timeout);
            reject({
                src: src,
                error: e,
                status: 'error'
            });
        };

        // Intentar cargar con headers específicos para evitar problemas de cache
        const url = new URL(src, window.location.origin);
        url.searchParams.set('t', Date.now()); // Cache busting
        audio.src = url.toString();
    });
}

// Ejecutar diagnóstico
async function runAudioDiagnostic() {
    console.log('🔍 Probando carga de archivos de audio...');
    
    for (const audioFile of audioFiles) {
        try {
            const result = await testAudioFile(audioFile);
            console.log(`✅ ${result.src} - Duración: ${Math.round(result.duration)}s`);
        } catch (error) {
            console.error(`❌ ${error.src || audioFile} - Error:`, error.error || error.message);
            
            // Información adicional de debugging
            fetch(audioFile, { method: 'HEAD' })
                .then(response => {
                    console.log(`📊 ${audioFile} - Status: ${response.status}, Size: ${response.headers.get('content-length')} bytes`);
                })
                .catch(fetchError => {
                    console.error(`🌐 ${audioFile} - Fetch error:`, fetchError);
                });
        }
    }
}

// Función para verificar el entorno
function checkEnvironment() {
    console.log('🌍 Información del entorno:');
    console.log('- URL:', window.location.href);
    console.log('- Protocol:', window.location.protocol);
    console.log('- Host:', window.location.host);
    console.log('- User Agent:', navigator.userAgent);
    
    // Verificar soporte de audio de forma segura
    const audioSupport = {};
    try {
        const audio = new Audio();
        audioSupport.mp3 = audio.canPlayType('audio/mpeg');
        audioSupport.wav = audio.canPlayType('audio/wav');
        audioSupport.ogg = audio.canPlayType('audio/ogg');
        
        console.log('🎵 Soporte de audio:', audioSupport);
        
        // Verificar capacidades del navegador
        console.log('📱 Capacidades del navegador:');
        console.log('- Service Worker:', 'serviceWorker' in navigator);
        console.log('- Cache API:', 'caches' in window);
        console.log('- Fetch API:', 'fetch' in window);
        
    } catch (e) {
        console.error('❌ Error verificando soporte de audio:', e.message);
    }
}

// Ejecutar diagnóstico cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            checkEnvironment();
            runAudioDiagnostic();
        }, 2000);
    });
} else {
    setTimeout(() => {
        checkEnvironment();
        runAudioDiagnostic();
    }, 2000);
}
