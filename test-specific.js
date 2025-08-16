// Test específico para la función toggleDetails
console.log('🧪 Testing toggleDetails functionality...');

// Esperar a que se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('\n📋 INICIANDO TEST DE toggleDetails');
        console.log('═'.repeat(50));
        
        // Encontrar todos los botones de toggle
        const toggleButtons = document.querySelectorAll('.toggle-details');
        console.log(`🔍 Encontrados ${toggleButtons.length} botones de toggle`);
        
        if (toggleButtons.length === 0) {
            console.error('❌ No se encontraron botones .toggle-details');
            return;
        }
        
        // Test cada botón
        toggleButtons.forEach((button, index) => {
            console.log(`\n🔘 Testing botón ${index + 1}:`);
            
            // Verificar estructura
            const cardBody = button.closest('.card-body') || button.closest('.culto-item');
            if (!cardBody) {
                console.error(`  ❌ No se encontró contenedor padre para botón ${index + 1}`);
                return;
            }
            console.log(`  ✅ Contenedor padre encontrado`);
            
            const details = cardBody.querySelector('.details');
            if (!details) {
                console.error(`  ❌ No se encontró elemento .details para botón ${index + 1}`);
                return;
            }
            console.log(`  ✅ Elemento .details encontrado`);
            
            // Verificar estado inicial
            const initialDisplay = details.style.display;
            const initialClass = details.classList.contains('visible');
            console.log(`  📊 Estado inicial: display="${initialDisplay}", visible=${initialClass}`);
            
            // Simular click
            console.log(`  🖱️ Simulando click...`);
            button.click();
            
            // Verificar después del click
            setTimeout(() => {
                const newDisplay = details.style.display;
                const newClass = details.classList.contains('visible');
                console.log(`  📊 Estado después del click: display="${newDisplay}", visible=${newClass}`);
                
                // Verificar si cambió
                if (newDisplay !== initialDisplay || newClass !== initialClass) {
                    console.log(`  ✅ Botón ${index + 1} funciona correctamente`);
                } else {
                    console.error(`  ❌ Botón ${index + 1} no cambió el estado`);
                }
                
                // Segundo click para restaurar
                button.click();
                setTimeout(() => {
                    const finalDisplay = details.style.display;
                    const finalClass = details.classList.contains('visible');
                    console.log(`  📊 Estado final: display="${finalDisplay}", visible=${finalClass}`);
                    
                    if (index === toggleButtons.length - 1) {
                        console.log('\n✅ Test de toggleDetails completado');
                    }
                }, 100);
            }, 100);
        });
        
    }, 2000); // Esperar 2 segundos para que todo se cargue
});

// Test del tema oscuro/claro
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('\n🌙 INICIANDO TEST DE TEMA');
        console.log('═'.repeat(50));
        
        const themeButton = document.getElementById('theme-toggle');
        if (!themeButton) {
            console.error('❌ Botón de tema no encontrado');
            return;
        }
        console.log('✅ Botón de tema encontrado');
        
        // Estado inicial
        const initialTheme = document.body.classList.contains('dark-theme');
        console.log(`📊 Tema inicial: ${initialTheme ? 'Oscuro' : 'Claro'}`);
        
        // Simular click
        console.log('🖱️ Simulando click en tema...');
        themeButton.click();
        
        setTimeout(() => {
            const newTheme = document.body.classList.contains('dark-theme');
            console.log(`📊 Tema después del click: ${newTheme ? 'Oscuro' : 'Claro'}`);
            
            if (newTheme !== initialTheme) {
                console.log('✅ Cambio de tema funciona correctamente');
            } else {
                console.error('❌ Cambio de tema no funciona');
            }
            
            // Restaurar tema original
            themeButton.click();
            console.log('🔄 Tema restaurado');
        }, 200);
        
    }, 3000); // Esperar 3 segundos
});

// Test de reproductores de audio
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('\n🎵 INICIANDO TEST DE AUDIO');
        console.log('═'.repeat(50));
        
        const audioPlayers = document.querySelectorAll('audio');
        console.log(`🔍 Encontrados ${audioPlayers.length} reproductores de audio`);
        
        if (audioPlayers.length === 0) {
            console.warn('⚠️ No se encontraron reproductores de audio');
            return;
        }
        
        audioPlayers.forEach((audio, index) => {
            console.log(`\n🎵 Reproductor ${index + 1}:`);
            
            const sources = audio.querySelectorAll('source');
            const hasControls = audio.hasAttribute('controls');
            const preload = audio.getAttribute('preload') || 'none';
            
            console.log(`  📂 Fuentes: ${sources.length}`);
            console.log(`  🎛️ Controles: ${hasControls ? 'Sí' : 'No'}`);
            console.log(`  ⏳ Precarga: ${preload}`);
            
            sources.forEach((source, sourceIndex) => {
                console.log(`    📁 Fuente ${sourceIndex + 1}: ${source.src}`);
                console.log(`    📋 Tipo: ${source.type || 'No especificado'}`);
            });
            
            if (sources.length > 0 && hasControls) {
                console.log(`  ✅ Reproductor ${index + 1} configurado correctamente`);
            } else {
                console.warn(`  ⚠️ Reproductor ${index + 1} mal configurado`);
            }
        });
        
        console.log('\n✅ Test de audio completado');
        
    }, 4000); // Esperar 4 segundos
});

// Test de navegación
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('\n🧭 INICIANDO TEST DE NAVEGACIÓN');
        console.log('═'.repeat(50));
        
        const navLinks = document.querySelectorAll('a[href^="#"]');
        console.log(`🔍 Encontrados ${navLinks.length} enlaces de navegación interna`);
        
        if (navLinks.length === 0) {
            console.warn('⚠️ No se encontraron enlaces de navegación interna');
            return;
        }
        
        let validLinks = 0;
        let brokenLinks = [];
        
        navLinks.forEach((link, index) => {
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                validLinks++;
                console.log(`✅ ${href} → Destino encontrado`);
            } else {
                brokenLinks.push(href);
                console.warn(`⚠️ ${href} → Destino no encontrado`);
            }
        });
        
        console.log(`\n📊 Resumen navegación:`);
        console.log(`  ✅ Enlaces válidos: ${validLinks}/${navLinks.length}`);
        console.log(`  ⚠️ Enlaces rotos: ${brokenLinks.length}`);
        
        if (brokenLinks.length > 0) {
            console.log(`  📋 Enlaces rotos: ${brokenLinks.join(', ')}`);
        }
        
        console.log('\n✅ Test de navegación completado');
        
    }, 5000); // Esperar 5 segundos
});

// Resumen final
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('\n🎯 RESUMEN FINAL DE TESTS');
        console.log('═'.repeat(50));
        console.log('✅ Tests completados:');
        console.log('  🔘 toggleDetails functionality');
        console.log('  🌙 Theme toggle');
        console.log('  🎵 Audio players');
        console.log('  🧭 Navigation links');
        console.log('\n📋 Revisa los logs anteriores para detalles específicos');
        console.log('🎉 Test suite ejecutado correctamente');
        
        // Mostrar notificación en pantalla
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: Arial, sans-serif;
                max-width: 300px;
            ">
                <h4 style="margin: 0 0 10px 0; font-size: 16px;">🧪 Tests Completados</h4>
                <p style="margin: 0; font-size: 14px;">
                    Los tests de funcionalidad se han ejecutado. 
                    Revisa la consola del navegador (F12) para ver los resultados detallados.
                </p>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                    font-size: 12px;
                ">Cerrar</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-remover notificación después de 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
        
    }, 6000); // Esperar 6 segundos para mostrar el resumen
});
