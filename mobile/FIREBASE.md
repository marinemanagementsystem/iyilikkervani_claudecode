# Firebase Yapılandırması - İyilik Kervanı Mobile

## 🔥 Firebase Proje Bilgileri

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA1kSE0St1cyTOyZlFycWgp2hkKO4Bwvl8",
  authDomain: "iyilikkernanimobile.firebaseapp.com",
  projectId: "iyilikkernanimobile",
  storageBucket: "iyilikkernanimobile.firebasestorage.app",
  messagingSenderId: "34126359922",
  appId: "1:34126359922:web:2cd44501f6456628ebc1eb",
  measurementId: "G-GL4GWD68B0"
};
```

## 📊 Firestore Koleksiyonları

### `users` - Kullanıcılar
| Alan | Tip | Açıklama |
|------|-----|----------|
| name | string | Kullanıcı adı |
| email | string | E-posta |
| role | string | "admin" veya "volunteer" |
| phone | string | Telefon |
| createdAt | timestamp | Oluşturulma tarihi |

### `households` - Haneler
| Alan | Tip | Açıklama |
|------|-----|----------|
| name | string | Aile adı |
| neighborhood | string | Mahalle |
| address | string | Tam adres |
| phone | string | Telefon |
| adults | number | Yetişkin sayısı |
| children | number | Çocuk sayısı |
| notes | string | Notlar |
| location | geopoint | Konum (lat, lng) |
| lastAidDate | timestamp | Son yardım tarihi |
| createdAt | timestamp | Kayıt tarihi |
| createdBy | string | Oluşturan kullanıcı UID |

### `households/{id}/aidHistory` - Yardım Geçmişi (Alt Koleksiyon)
| Alan | Tip | Açıklama |
|------|-----|----------|
| type | string | Yardım türü |
| date | timestamp | Yardım tarihi |
| addedBy | string | Ekleyen UID |
| addedByName | string | Ekleyen ismi |
| notes | string | Notlar |
| amount | string | Miktar |

## 🚦 Traffic Light Sistemi
- **Kırmızı**: 90+ gün yardım almamış
- **Sarı**: 30-90 gün yardım almamış
- **Yeşil**: 30 günden az önce yardım almış

## 👤 Test Kullanıcıları
| E-posta | Şifre | Rol |
|---------|-------|-----|
| admin@test.com | (Firebase'de belirlenen) | Admin |

## 🔐 Firestore Rules (Geliştirme)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 🔗 Firebase Console
https://console.firebase.google.com/project/iyilikkernanimobile
