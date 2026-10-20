@echo off
setlocal
cd /d "%~dp0"
title SaLu - Asistente de escritorio

where python >nul 2>nul
if errorlevel 1 (
  echo No se encontro Python.
  echo Instala Python 3.11 o superior y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

echo ========================================
echo             INICIANDO SALU
echo ========================================
echo.
echo Comprobando dependencias necesarias...
python -m pip install -r requirements.txt
if errorlevel 1 (
  echo.
  echo No se pudieron instalar las dependencias.
  echo Revisa tu conexion a internet e intentalo otra vez.
  pause
  exit /b 1
)

echo.
echo Abriendo SaLu en una ventana de escritorio...
python iniciar_escritorio.py
if errorlevel 1 (
  echo.
  echo SaLu se cerro con un error. Revisa el mensaje anterior.
  pause
)
endlocal
