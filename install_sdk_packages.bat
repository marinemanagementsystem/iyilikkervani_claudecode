@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
cd C:\Users\Admin\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
echo y | sdkmanager.bat "platform-tools" "platforms;android-33" "build-tools;33.0.0"
