# SaLu — versión de escritorio

## Cómo iniciar
1. Extrae la carpeta completa en una ubicación permanente (por ejemplo, Documentos\SaLu).
2. Comprueba que Python 3.11 o superior esté instalado.
3. Haz doble clic en `INICIAR_SALU.bat`.
4. La primera vez instalará las dependencias indicadas en `requirements.txt`; necesitas conexión a internet para esta instalación.
5. Se abrirá una ventana de escritorio. Si la ventana integrada no funciona en ese Windows, el lanzador intentará abrir SaLu en el navegador.

## Requisitos
- Python 3.11 o superior.
- Ollama instalado y ejecutándose para utilizar las respuestas del modelo local.
- El modelo configurado en `app.py` descargado en Ollama.
- Para la ventana integrada en Windows, WebView2 debe estar disponible. En caso contrario, puede utilizarse el navegador como alternativa.

## Importante
- No borres `memoria.json`, `categorias_memoria.json`, `uploads`, `static` ni `SaluPrincipal`.
- El servidor solo escucha en `127.0.0.1`, es decir, en el propio PC.
- Cierra la ventana de SaLu para terminar la sesión. Si el lanzador cae al navegador por un error de la ventana integrada, la consola permanecerá abierta para que puedas cerrarlo con Enter.
- Esta versión no configura todavía el inicio automático de Windows; primero conviene comprobar que la ventana de escritorio funciona correctamente.
