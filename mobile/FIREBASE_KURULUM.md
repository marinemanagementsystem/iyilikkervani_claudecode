# Firebase Kurulum Rehberi

## 1. Firebase Console'da Yapılacaklar

### A. Authentication Aç
1. https://console.firebase.google.com/project/iyilikkernanimobile/authentication
2. **Sign-in method** sekmesine git
3. **Email/Password** satırına tıkla
4. **Enable** yap ve Save

### B. Firestore Database Oluştur
1. https://console.firebase.google.com/project/iyilikkernanimobile/firestore
2. **Create database** tıkla
3. **Start in production mode** seç
4. Location: **eur3 (europe-west)** seç
5. **Enable** tıkla

### C. Security Rules Deploy Et
1. Firestore > Rules sekmesine git
2. Bu projedeki `firestore.rules` dosyasının içeriğini yapıştır
3. **Publish** tıkla

### D. İlk Admin Kullanıcı Oluştur

**YÖNTEMİ 1: Firebase Console'dan (Önerilen)**

1. Authentication > Users sekmesine git
2. **Add user** tıkla
3. Email: `admin@app.local`
4. Password: `istedigin_sifre`
5. **Add user** tıkla
6. Oluşan kullanıcının **UID**'sini kopyala

7. Firestore > Data sekmesine git
8. **Start collection** tıkla
9. Collection ID: `users`
10. Document ID: **Kopyaladığın UID**
11. Alanları ekle:
    - `username` (string): `admin`
    - `role` (string): `admin`
    - `assignedRegionId` (null)
    - `isActive` (boolean): `true`
    - `createdAt` (timestamp): (şu anki zaman)

### E. system_settings Oluştur (Force Update için)

1. Firestore > Data > **Start collection**
2. Collection ID: `system_settings`
3. Document ID: `config`
4. Alanlar:
    - `min_required_version` (string): `1.0.0`
    - `maintenanceMode` (boolean): `false`

## 2. Uygulamayı Test Et

```bash
cd mobile
npm install
npm start
```

Tarayıcıda http://localhost:3000 açılacak.

Giriş bilgileri:
- Kullanıcı adı: `admin`
- Şifre: `yukarıda belirlediğin şifre`

## 3. APK Oluştur

```bash
# Android projesini oluştur
npx cap add android

# Sync yap
npx cap sync

# APK build et (Windows)
build-apk.bat

# Veya manuel:
cd android
.\gradlew assembleDebug
```

APK dosyası: `android/app/build/outputs/apk/debug/app-debug.apk`

## 4. Sorun Giderme

### "Index required" Hatası
- Console'da görünen linke tıkla
- Firebase otomatik index oluşturma sayfası açılacak
- **Create index** tıkla

### "Permission denied" Hatası
- Security Rules doğru deploy edilmemiş olabilir
- Rules sekmesini kontrol et

### Giriş yapamıyorum
- Authentication > Users'dan kullanıcının var olduğunu kontrol et
- Firestore > users koleksiyonunda kullanıcı dokümanının olduğunu kontrol et
