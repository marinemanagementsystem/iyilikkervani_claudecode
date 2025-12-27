@echo off
echo ========================================
echo   IYILIK YONETIM - APK BUILD
echo ========================================
echo.

echo [1/3] Capacitor sync yapiliyor...
call npx cap sync android
if errorlevel 1 goto error

echo.
echo [2/3] Android projesi derleniyor...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 goto error

echo.
echo [3/3] APK kopyalaniyor...
cd ..
copy android\app\build\outputs\apk\debug\app-debug.apk .\iyilik-yonetim.apk

echo.
echo ========================================
echo   BASARILI! APK olusturuldu:
echo   iyilik-yonetim.apk
echo ========================================
goto end

:error
echo.
echo HATA! Build basarisiz oldu.
pause
exit /b 1

:end
pause
