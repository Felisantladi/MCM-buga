// Servidor simple para manejar endpoints de analytics
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;
    
    // Configurar headers de seguridad
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // API endpoints
    if (pathname.startsWith('/api/')) {
        handleAPIRequest(req, res, pathname, method);
        return;
    }

    // Static file serving
    serveStaticFile(req, res, pathname);
});

function handleAPIRequest(req, res, pathname, method) {
    console.log(`API Request: ${method} ${pathname}`);

    switch (pathname) {
        case '/api/analytics':
            if (method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        console.log('Analytics data received:', data);
                        
                        // Aquí se puede procesar la data de analytics
                        // Por ahora solo la logueamos
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Analytics data received',
                            timestamp: new Date().toISOString()
                        }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: false, 
                            error: 'Invalid JSON data' 
                        }));
                    }
                });
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Method not allowed' 
                }));
            }
            break;

        case '/api/contact':
            if (method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    try {
                        const formData = JSON.parse(body);
                        console.log('Contact form data received:', formData);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Mensaje enviado correctamente',
                            timestamp: new Date().toISOString()
                        }));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: false, 
                            error: 'Invalid form data' 
                        }));
                    }
                });
            } else {
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    error: 'Method not allowed' 
                }));
            }
            break;

        case '/api/status':
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: true, 
                message: 'Server is running',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }));
            break;

        default:
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'API endpoint not found' 
            }));
    }
}

function serveStaticFile(req, res, pathname) {
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Decodificar la URL para manejar espacios y caracteres especiales
    const decodedPathname = decodeURIComponent(pathname);
    const filePath = path.join(PUBLIC_DIR, decodedPathname);
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Verificar si el archivo existe primero
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si no existe, intenta sin decodificar (fallback)
            const fallbackPath = path.join(PUBLIC_DIR, pathname);
            
            fs.access(fallbackPath, fs.constants.F_OK, (fallbackErr) => {
                if (fallbackErr) {
                    console.log(`File not found: ${pathname} (tried: ${filePath} and ${fallbackPath})`);
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - File Not Found</h1>');
                    return;
                }
                
                // Servir archivo con ruta fallback
                serveFile(fallbackPath, contentType, res, pathname);
            });
            return;
        }
        
        // Servir archivo con ruta decodificada
        serveFile(filePath, contentType, res, pathname);
    });
}

function serveFile(filePath, contentType, res, pathname) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`Error reading file ${pathname}:`, err.message);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('<h1>500 - Internal Server Error</h1>');
            return;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
        console.log(`Served: ${pathname}`);
    });
}

server.listen(PORT, () => {
    console.log(`🚀 MCM Buga Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${PUBLIC_DIR}`);
    console.log(`📡 API endpoints available:`);
    console.log(`   POST /api/analytics - Analytics data`);
    console.log(`   POST /api/contact - Contact form`);
    console.log(`   GET  /api/status - Server status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
