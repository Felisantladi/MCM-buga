# Predicas

Guarda aquí los textos de cada prédica en archivos `.txt` y registra el listado en `index.json`.

## Cómo agregar una nueva prédica
1. Crea un archivo `.txt` con el contenido, por ejemplo: `predicas/mi-nueva-predica.txt`.
2. Abre `predicas/index.json` y agrega un objeto al final con este formato:
   {
     "id": "mi-nueva-predica",              // slug único y corto (sin espacios)
     "title": "Título de la prédica",
     "audio": "audio/Archivo-de-audio.mp3", // ruta al audio en la carpeta /audio
     "summary": "Resumen breve (1–2 líneas)",
     "content": "predicas/mi-nueva-predica.txt",
     "date": "YYYY-MM-DD"                    // fecha para ordenar
   }
3. Guarda los cambios. La web cargará automáticamente la nueva prédica.

Notas:
- Los archivos se cargan dinámicamente mediante `js/main.js` usando `fetch`. Para probar localmente, usa un servidor estático (por ejemplo la extensión "Live Server" de VS Code o `npx serve`). Abrir el HTML directamente como `file://` puede bloquear las solicitudes.
- El indicador "NOVEDAD" del menú depende del atributo `data-updated` de la sección `#predicas` en `index.html`. Puedes actualizarlo a la fecha/hora actual si quieres mostrar la pastilla de novedad.
