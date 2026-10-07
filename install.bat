@echo off
setlocal EnableDelayedExpansion
title EMA Lightning - Native Host Kayit Araci

echo ========================================================
echo   EMA Lightning Chrome Extension - Kurulum Araci
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "JSON_PATH=%SCRIPT_DIR%com.emalightning.tts.json"
set "BAT_PATH=%SCRIPT_DIR%run_host.bat"

:: Ters slash kacislari
set "ESCAPED_BAT=%BAT_PATH:\=\\%"

echo [*] Chrome Eklenti Kimliginizi (ID) girin:
echo     (chrome://extensions sayfasindaki 32 haneli kimlik)
set /p EXT_ID="Eklenti ID: "

if "%EXT_ID%"=="" (
    echo [!] Hata: Gecerli bir eklenti ID'si girmediniz!
    pause
    exit /b 1
)

echo [*] Manifest dosyasi olusturuluyor...
(
echo {
echo   "name": "com.emalightning.tts",
echo   "description": "EMA Lightning Native Audio Synthesizer Host",
echo   "path": "%ESCAPED_BAT%",
echo   "type": "stdio",
echo   "allowed_origins": [
echo     "chrome-extension://%EXT_ID%/"
echo   ]
echo }
) > "%JSON_PATH%"

echo [*] Windows Kayit Defterine (HKCU) yaziliyor...
reg add "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.emalightning.tts" /ve /t REG_SZ /d "%JSON_PATH%" /f >nul

if %errorlevel% equ 0 (
    echo.
    echo [+] Basarili! Native Messaging host basariyla kaydedildi.
    echo [*] Chrome'u ve sekmelerinizi yenileyerek kullanmaya baslayabilirsiniz.
) else (
    echo.
    echo [!] Kayit defteri yazma hatasi olustu.
)

echo.
pause
