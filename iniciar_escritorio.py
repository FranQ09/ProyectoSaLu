"""Lanzador de escritorio para SaLu con icono personalizado en Windows."""
from __future__ import annotations

import os
import socket
import threading
import time
import webbrowser
from pathlib import Path
from urllib.error import URLError
from urllib.request import urlopen

from app import app

HOST = "127.0.0.1"
PORT = 5000
URL = f"http://{HOST}:{PORT}"
TITLE = "SaLu | Asistente personal"
ROOT = Path(__file__).resolve().parent
ICON_PATH = ROOT / "SaLu_icono.ico"


def _port_is_open() -> bool:
    try:
        with socket.create_connection((HOST, PORT), timeout=0.4):
            return True
    except OSError:
        return False


def _start_server() -> None:
    app.run(host=HOST, port=PORT, debug=False, use_reloader=False, threaded=True)


def _wait_for_server(timeout: float = 20.0) -> bool:
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        try:
            with urlopen(URL, timeout=0.8) as response:
                if response.status < 500:
                    return True
        except (OSError, URLError):
            time.sleep(0.25)
    return False


def _apply_windows_icon(title: str, icon_path: str) -> None:
    """Aplica el .ico al HWND de pywebview; es un mejor esfuerzo en Windows."""
    if os.name != "nt" or not os.path.isfile(icon_path):
        return
    try:
        import ctypes
        from ctypes import wintypes

        user32 = ctypes.WinDLL("user32", use_last_error=True)
        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        try:
            ctypes.WinDLL("shell32").SetCurrentProcessExplicitAppUserModelID("SaLu.AsistentePersonal")
        except Exception:
            pass

        IMAGE_ICON = 1
        LR_LOADFROMFILE = 0x0010
        LR_DEFAULTSIZE = 0x0040
        WM_SETICON = 0x0080
        ICON_SMALL, ICON_BIG = 0, 1
        GCLP_HICON, GCLP_HICONSM = -14, -34
        hicon = user32.LoadImageW(None, icon_path, IMAGE_ICON, 0, 0, LR_LOADFROMFILE | LR_DEFAULTSIZE)
        if not hicon:
            return

        hwnd_found = wintypes.HWND()
        enum_proc_type = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

        def enum_proc(hwnd, _):
            length = user32.GetWindowTextLengthW(hwnd)
            if length <= 0:
                return True
            buf = ctypes.create_unicode_buffer(length + 1)
            user32.GetWindowTextW(hwnd, buf, length + 1)
            if buf.value == title:
                hwnd_found.value = hwnd
                return False
            return True

        callback = enum_proc_type(enum_proc)
        for _ in range(20):
            user32.EnumWindows(callback, 0)
            if hwnd_found.value:
                break
            time.sleep(0.25)
        hwnd = hwnd_found.value
        if hwnd:
            user32.SendMessageW(hwnd, WM_SETICON, ICON_SMALL, hicon)
            user32.SendMessageW(hwnd, WM_SETICON, ICON_BIG, hicon)
            # GCLP_* usa SetClassLongPtr en 64 bits.
            set_class_long_ptr = getattr(user32, "SetClassLongPtrW", user32.SetClassLongW)
            set_class_long_ptr(hwnd, GCLP_HICON, hicon)
            set_class_long_ptr(hwnd, GCLP_HICONSM, hicon)
    except Exception:
        # No impedir el inicio de SaLu si Windows no permite aplicar el icono.
        pass


def main() -> None:
    if _port_is_open():
        print(f"El puerto {PORT} ya está en uso. Cierra otra instancia de SaLu e inténtalo de nuevo.")
        input("Presiona Enter para salir...")
        return

    server = threading.Thread(target=_start_server, name="SaLu-Flask", daemon=True)
    server.start()
    if not _wait_for_server():
        raise RuntimeError("SaLu no respondió en el tiempo esperado al iniciar Flask.")

    try:
        import webview
        webview.create_window(
            TITLE,
            URL,
            width=1180,
            height=780,
            min_size=(760, 560),
            background_color="#080b16",
        )
        # pywebview ejecuta esta función una vez inicializada la ventana nativa.
        webview.start(func=_apply_windows_icon, args=(TITLE, str(ICON_PATH)))
    except Exception as exc:
        print(f"No se pudo abrir la ventana integrada ({exc}).")
        print("Se abrirá SaLu en el navegador predeterminado.")
        webbrowser.open(URL)
        input("SaLu sigue ejecutándose. Presiona Enter para cerrar el servidor... ")


if __name__ == "__main__":
    main()
