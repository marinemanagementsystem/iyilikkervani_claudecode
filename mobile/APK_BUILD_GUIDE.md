# Android APK Build Rehberi (Capacitor)

Bu proje Vite + Capacitor ile çalışır. APK üretimi için aşağıdaki adımları kullanın.

## Gereksinimler
- Node.js (LTS)
- Android Studio + Android SDK (API 33+ önerilir)
- JAVA_HOME ve ANDROID_HOME ortam değişkenleri

## Hızlı Build (Debug APK)
```bash
cd mobile
npm install
npm run build
npm run sync
cd android
./gradlew assembleDebug
```

APK çıktısı:
```
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## Kısayol Script
```bash
cd mobile
npm run build:android
```

## Release APK (İmzalı)
Release için imza anahtarı gerekir.
```bash
cd mobile
npm run build
npm run sync
cd android
./gradlew assembleRelease
```

## QA Kontrol Listesi (Özet)
- Login (admin + gönüllü)
- Bölge seçimi (gönüllü ilk girişte)
- Bölge CRUD (admin panel)
- Kullanıcı CRUD (admin panel)
- Hane CRUD (telefon mükerrer kontrol)
- Yardım CRUD + kanıt fotoğrafı
- Trafik ışığı sıralaması (needLevel + son yardım)
- Force update kontrolü (system_settings/app)
- Offline mod (uçak modu + tekrar online)

## Notlar
- build:android scripti `npm run build && npx cap sync && cd android && ./gradlew assembleDebug` çalıştırır.
- İlk build daha uzun sürebilir.
