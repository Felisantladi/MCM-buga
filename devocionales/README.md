# Devocionales

Guarda aquí el listado de devocionales en `index.json`. El sitio los carga dinámicamente (sin servidor) desde `js/main.js`.

## Cómo agregar un devocional
1. Abre `devocionales/index.json`.
2. Agrega un objeto con este formato:
   {
     "id": "gracia-cada-manana",      // slug único (sin espacios)
     "title": "Gracia cada mañana",   // título visible en la tarjeta
     "verse": "Salmo 5:3",            // cita breve (opcional pero recomendado)
     "url": "https://...",            // enlace público (Notion, blog, etc.)
     "date": "YYYY-MM-DD"             // para ordenar de más nuevo a más antiguo
   }
3. Guarda. Recarga la página y verás el devocional en la sección.

## Notion
- Si usas una Base de Datos en Notion, compárteme:
  - El enlace de la base pública o
  - El `database_id` + una clave de API (para una integración futura bajo servidor).
- En un sitio estático, lo más simple es exportar/capturar los enlaces y pegarlos en `index.json`.

## Tips
- Usa fechas consistentes para el orden.
- Mantén títulos y citas cortas.
- Puedes editar la pastilla “NOVEDAD” actualizando `data-updated` en la sección `#devocionales` de `index.html`.
