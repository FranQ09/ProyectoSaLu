# SaLu Web — prototipo funcional

Interfaz web local inspirada en JARVIS, con identidad cian/violeta, núcleo animado, chat, carga de archivos y backend Python/Ollama.

## Requisitos
- Python 3.10+
- Ollama instalado y abierto
- Modelo local `qwen3:1.7b` (o define `SALU_MODEL` con otro modelo)

En una terminal:
```bash
ollama pull qwen3:1.7b
```
En Windows, ejecuta `INICIAR_SALU.bat`. Instala dependencias y abre el servidor local en `http://127.0.0.1:5000`.

## Archivos compatibles
PDF con texto, DOCX, TXT, PY, JS, HTML, CSS, JSON, Markdown, CSV, XLSX y varias imágenes. Los PDF escaneados y las imágenes necesitan OCR para extraer texto; el soporte OCR es opcional y requiere instalar Tesseract por separado.

## Memoria
`memoria.json` y `categorias_memoria.json` se guardan junto a `app.py`. Se pueden reutilizar copias de los archivos de memoria de la versión Tkinter. Haz copia de seguridad antes de migrar.

## Seguridad y límites del prototipo
El servidor solo escucha en `127.0.0.1`, por lo que no está expuesto a la red local. Los archivos subidos se guardan en `uploads/`. No cargues archivos sensibles en un PC compartido. El contenido extraído se limita para evitar prompts enormes. La conversación se mantiene en memoria mientras el servidor está abierto; la memoria persistente de usuario se guarda en JSON.

## Importante
Este prototipo recrea las funciones principales (chat Ollama, archivos, memoria JSON y estado del backend), pero no importa automáticamente todas las reglas especializadas del antiguo script Tkinter. La búsqueda web y otras rutinas específicas deben migrarse y probarse por separado antes de reemplazar tu versión antigua.


## Mejoras de contexto (versión corregida)
- El historial se separa por sesión del navegador.
- El botón «Limpiar» también reinicia el historial del servidor.
- Las instrucciones refuerzan el español, la respuesta a la pregunta actual y la honestidad ante incertidumbre.
- El modelo aún puede equivocarse; estas mejoras reducen errores de contexto, pero no garantizan exactitud factual.
