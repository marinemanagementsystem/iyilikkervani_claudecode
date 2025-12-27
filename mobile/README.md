# İyilik Yönetim Sistemi

Muhtaç haneleri takip eden, yardımları kaydeden ve adil dağıtımı destekleyen mobil uygulama.

## Teknolojiler
- **Frontend:** Vite + Alpine.js + Tailwind (tek sayfa)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Mobile:** Capacitor (Android)

## Kurulum
```bash
cd mobile
npm install
```

## Geliştirme (Web)
```bash
npm run dev
```

## Android (Capacitor)
```bash
npm run build
npm run sync
npm run android
```

## APK Build
Detaylı anlatım için: `APK_BUILD_GUIDE.md`

## Öne Çıkan Özellikler
- Admin / Gönüllü rolleri
- Bölge bazlı yetkilendirme
- Hane CRUD + telefon mükerrer kontrolü
- Yardım CRUD + kanıt fotoğrafı
- Trafik ışığı önceliklendirme (needLevel + son yardım)
- Force update kontrolü (`system_settings`)
- Offline-first Firestore cache

## Firebase Koleksiyonları
- `users`
- `regions`
- `households`
- `aid_transactions`
- `system_settings`
