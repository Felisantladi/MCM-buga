// Script para convertir imágenes a formato AVIF usando sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './assets/images';
const outputDir = './assets/images';

// Lista de imágenes a convertir
const imagesToConvert = [
    'Logo MCm.png',
    'Pastora.jpg',
    'Ministerio de Niños.jpg',
    'Ministerio Nuiños 2.jpg',
    'SERVIcio niños.jpg',
    'Sirviendo.jpg'
];

async function convertToAVIF() {
    console.log('🎨 Iniciando conversión de imágenes a AVIF...');
    
    for (const image of imagesToConvert) {
        try {
            const inputPath = path.join(inputDir, image);
            const outputName = path.parse(image).name + '.avif';
            const outputPath = path.join(outputDir, outputName);
            
            // Verificar si el archivo de entrada existe
            if (!fs.existsSync(inputPath)) {
                console.log(`❌ No se encuentra: ${inputPath}`);
                continue;
            }
            
            console.log(`🔄 Convirtiendo: ${image} -> ${outputName}`);
            
            await sharp(inputPath)
                .avif({ 
                    quality: 80,
                    effort: 6 // Mayor esfuerzo para mejor compresión
                })
                .toFile(outputPath);
                
            console.log(`✅ Convertido: ${outputName}`);
            
        } catch (error) {
            console.error(`❌ Error convirtiendo ${image}:`, error.message);
        }
    }
    
    console.log('🎉 Conversión completada!');
    
    // Crear también versiones WebP como fallback
    console.log('🔄 Creando versiones WebP como fallback...');
    
    for (const image of imagesToConvert) {
        try {
            const inputPath = path.join(inputDir, image);
            const outputName = path.parse(image).name + '.webp';
            const outputPath = path.join(outputDir, outputName);
            
            if (!fs.existsSync(inputPath)) {
                continue;
            }
            
            console.log(`🔄 Convirtiendo a WebP: ${image} -> ${outputName}`);
            
            await sharp(inputPath)
                .webp({ 
                    quality: 85,
                    effort: 6
                })
                .toFile(outputPath);
                
            console.log(`✅ WebP creado: ${outputName}`);
            
        } catch (error) {
            console.error(`❌ Error creando WebP ${image}:`, error.message);
        }
    }
    
    console.log('🎉 Todas las conversiones completadas!');
}

// Verificar si sharp está instalado
try {
    require.resolve('sharp');
    convertToAVIF();
} catch (error) {
    console.log('📦 Sharp no está instalado. Instalando...');
    console.log('Ejecuta: npm install sharp');
    console.log('Luego ejecuta este script nuevamente.');
}
