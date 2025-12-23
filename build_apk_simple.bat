@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\Admin\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%
cd mobile\android
echo Building APK...
gradlew.bat assembleDebug -x :expo-modules-core:compileDebugKotlin
echo.
echo APK hazir! Konum:
echo C:\SELDA\imobil\mobile\android\app\build\outputs\apk\debug\app-debug.apk
pause