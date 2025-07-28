// Script de diagnóstico para verificar carga de imágenes
console.log('🔍 Iniciando diagnóstico de carga de imágenes...');

function diagnosticarImagenes() {
    const imagenes = document.querySelectorAll('img');
    const results = [];
    
    console.log(`📊 Encontradas ${imagenes.length} imágenes en la página`);
    
    imagenes.forEach((img, index) => {
        const resultado = {
            index: index + 1,
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            loading: img.loading || 'auto'
        };
        
        if (img.complete && img.naturalWidth > 0) {
            resultado.status = '✅ Cargada correctamente';
            resultado.size = `${img.naturalWidth}x${img.naturalHeight}`;
        } else if (img.complete && img.naturalWidth === 0) {
            resultado.status = '❌ Error al cargar';
            resultado.error = 'Imagen no encontrada o corrupta';
        } else {
            resultado.status = '⏳ Cargando...';
        }
        
        results.push(resultado);
    });
    
    console.table(results);
    
    // Verificar también pictures
    const pictures = document.querySelectorAll('picture');
    if (pictures.length > 0) {
        console.log(`🖼️ Encontrados ${pictures.length} elementos picture`);
        
        pictures.forEach((picture, index) => {
            const sources = picture.querySelectorAll('source');
            const img = picture.querySelector('img');
            
            console.log(`📷 Picture ${index + 1}:`);
            console.log(`   - Sources: ${sources.length}`);
            sources.forEach((source, sIndex) => {
                console.log(`     ${sIndex + 1}. ${source.srcset} (${source.type})`);
            });
            console.log(`   - Fallback: ${img ? img.src : 'No encontrado'}`);
            console.log(`   - Estado: ${img && img.complete ? '✅' : '⏳'}`);
        });
    }
    
    // Verificar carga de audio
    const audios = document.querySelectorAll('audio');
    if (audios.length > 0) {
        console.log(`🎵 Encontrados ${audios.length} elementos de audio`);
        
        audios.forEach((audio, index) => {
            const sources = audio.querySelectorAll('source');
            console.log(`🎼 Audio ${index + 1}:`);
            sources.forEach((source, sIndex) => {
                console.log(`   ${sIndex + 1}. ${source.src} (${source.type})`);
            });
            console.log(`   - Ready State: ${audio.readyState}/4`);
            console.log(`   - Network State: ${audio.networkState}/3`);
        });
    }
    
    return results;
}

// Ejecutar diagnóstico cuando todo esté cargado
window.addEventListener('load', () => {
    setTimeout(() => {
        const results = diagnosticarImagenes();
        
        const errores = results.filter(r => r.status.includes('❌'));
        const cargando = results.filter(r => r.status.includes('⏳'));
        const exitosas = results.filter(r => r.status.includes('✅'));
        
        console.log(`\n📋 RESUMEN DEL DIAGNÓSTICO:`);
        console.log(`✅ Imágenes cargadas: ${exitosas.length}`);
        console.log(`❌ Imágenes con error: ${errores.length}`);
        console.log(`⏳ Imágenes cargando: ${cargando.length}`);
        
        if (errores.length > 0) {
            console.log(`\n🚨 ERRORES ENCONTRADOS:`);
            errores.forEach(error => {
                console.log(`   • ${error.src} - ${error.error}`);
            });
        }
        
        if (cargando.length > 0) {
            console.log(`\n⏳ IMÁGENES AÚN CARGANDO:`);
            cargando.forEach(loading => {
                console.log(`   • ${loading.src}`);
            });
            
            // Verificar de nuevo en 5 segundos
            setTimeout(() => {
                console.log('\n🔄 Verificación adicional después de 5 segundos...');
                diagnosticarImagenes();
            }, 5000);
        }
        
        // Verificar soporte de formatos modernos
        console.log(`\n🎨 SOPORTE DE FORMATOS:`);
        console.log(`WebP: ${window.imageOptimization?.supportsWebP ? '✅' : '❌'}`);
        console.log(`AVIF: ${window.imageOptimization?.supportsAVIF ? '✅' : '❌'}`);
        
    }, 2000); // Esperar 2 segundos para que las imágenes tengan tiempo de cargar
});

// Función para probar carga manual de imagen
window.testImageLoad = function(src) {
    console.log(`🧪 Probando carga de: ${src}`);
    
    const img = new Image();
    img.onload = () => {
        console.log(`✅ Imagen cargada exitosamente: ${src}`);
        console.log(`   Dimensiones: ${img.naturalWidth}x${img.naturalHeight}`);
    };
    img.onerror = (error) => {
        console.log(`❌ Error cargando imagen: ${src}`);
        console.log(`   Error:`, error);
    };
    img.src = src;
};

// Función para probar todos los formatos de una imagen
window.testAllFormats = function(baseName) {
    const formats = ['avif', 'webp', 'jpg', 'png'];
    
    console.log(`🔬 Probando todos los formatos para: ${baseName}`);
    
    formats.forEach(format => {
        const src = `./assets/images/${baseName}.${format}`;
        testImageLoad(src);
    });
};

console.log('✨ Diagnóstico de imágenes listo!');
console.log('💡 Comandos disponibles:');
console.log('   • diagnosticarImagenes() - Ejecutar diagnóstico completo');
console.log('   • testImageLoad("ruta/imagen.jpg") - Probar carga de imagen específica');
console.log('   • testAllFormats("Logo MCm") - Probar todos los formatos de una imagen');
