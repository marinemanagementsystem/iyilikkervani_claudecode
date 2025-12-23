@echo off
echo ================================================
echo   Android SDK Kurulum Script
echo ================================================
echo.
echo SDK Kurulumu baslatiliyor...
echo.

REM Open Android Studio SDK Manager
start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe"

echo.
echo ================================================
echo   LUTFEN ASAGIDAKI ADIMLARI TAKIP EDIN:
echo ================================================
echo.
echo 1. Android Studio acildi
echo 2. Ilk ekranda "More Actions" > "SDK Manager" tiklayin
echo    (veya projede: Tools > SDK Manager)
echo.
echo 3. SDK Platforms sekmesinde:
echo    - Android 13.0 (Tiramisu) [API 33] isaretleyin
echo    veya herhangi bir Android versiyonunu secin
echo.
echo 4. SDK Tools sekmesinde su paketlerin yuklu oldugunu kontrol edin:
echo    - Android SDK Build-Tools
echo    - Android SDK Platform-Tools
echo    - Android SDK Command-line Tools
echo.
echo 5. "Apply" veya "OK" tiklayin
echo 6. SDK indirme tamamlanana kadar bekleyin (2-5 dakika)
echo.
echo 7. SDK kurulumu tamamlandiktan sonra bu pencereye donun
echo    ve Enter'a basin
echo.
echo ================================================
pause
echo.
echo SDK kurulumu tamamlandi!
echo APK build baslatiliyor...
echo.

cd C:\SELDA\imobil\mobile\android
gradlew.bat assembleDebug

echo.
echo ================================================
echo   APK HAZIRLANDI!
echo ================================================
echo.
echo APK Konumu:
echo C:\SELDA\imobil\mobile\android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
