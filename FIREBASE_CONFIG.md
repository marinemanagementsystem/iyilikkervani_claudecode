# Firebase Konfigurasyonu - İyilik Kervanı

## Proje Bilgileri

| Alan | Değer |
|------|-------|
| Proje Adı | iyilikkernanimobile |
| Proje ID | iyilikkernanimobile |
| Region | us-central (default) |

## Firebase Config

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA1kSE0St1cyTOyZlFycWgp2hkKO4Bwvl8",
  authDomain: "iyilikkernanimobile.firebaseapp.com",
  projectId: "iyilikkernanimobile",
  storageBucket: "iyilikkernanimobile.firebasestorage.app",
  messagingSenderId: "34126359922",
  appId: "1:34126359922:web:2cd44501f6456628ebc1eb"
};
```

## Firebase Console URL

```
https://console.firebase.google.com/project/iyilikkernanimobile
```

## Kullanılan Servisler

### 1. Firebase Authentication
- Email/Password authentication aktif
- Kullanıcılar `username@app.local` veya gerçek email formatında

### 2. Cloud Firestore
- Database mode: Production
- Location: Default (us-central)

### 3. Firebase Storage
- Yardım fotoğrafları için kullanılıyor
- Path: `aid_photos/{householdId}/{timestamp}.jpg`

---

## Giriş Bilgileri

### Admin Kullanıcı
| Alan | Değer |
|------|-------|
| Email | admin@test.com |
| Şifre | test123456 |
| Rol | admin |
| UID | 1SCh767lDfVxqQe0cuOUfSYVqSj2 |

### Gönüllü Kullanıcılar
| Kullanıcı Adı | Email | Şifre | Bölge |
|---------------|-------|-------|-------|
| mehmet.sultanorhan | mehmet.sultanorhan@app.local | gonullu123 | Sultan Orhan Mah. |
| ayse.sultanorhan | ayse.sultanorhan@app.local | gonullu123 | Sultan Orhan Mah. |
| ali.ademyavuz | ali.ademyavuz@app.local | gonullu123 | Adem Yavuz Mah. |
| fatma.ademyavuz | fatma.ademyavuz@app.local | gonullu123 | Adem Yavuz Mah. |
| osman.baglarbasi | osman.baglarbasi@app.local | gonullu123 | Bağlarbaşı Mah. |
| merve.baglarbasi | merve.baglarbasi@app.local | gonullu123 | Bağlarbaşı Mah. |
| ibrahim.bayramoglu | ibrahim.bayramoglu@app.local | gonullu123 | Bayramoğlu Mah. |
| serkan.fevzi | serkan.fevzi@app.local | gonullu123 | Fevzi Çakmak Mah. |

---

## Firestore Koleksiyonları

### 1. `regions` - Bölgeler
```typescript
{
  id: string;           // Auto-generated
  name: string;         // "Sultan Orhan Mah."
  city: string;         // "Kocaeli"
  district: string;     // "Gebze" | "Darıca"
  createdAt: Timestamp;
}
```

### 2. `users` - Kullanıcılar
```typescript
{
  id: string;              // Firebase Auth UID
  username: string;        // "mehmet.sultanorhan"
  usernameLower: string;   // "mehmet.sultanorhan" (lowercase for search)
  name: string;            // "Mehmet Yıldız"
  role: 'admin' | 'volunteer';
  assignedRegionId: string | null;
  isActive: boolean;
  createdAt: Timestamp;
}
```

### 3. `households` - Haneler (İhtiyaç Sahipleri)
```typescript
{
  id: string;
  familyName: string;           // "Yılmaz Ailesi"
  regionId: string;             // Reference to regions
  primaryPhone: string;         // "0532 123 45 67"
  primaryPhoneNormalized: string; // "05321234567"
  address: string;
  needLevel: number;            // 1-5 (5 = en acil)
  status: 'active' | 'archived';
  members: Array<{
    name: string;
    age: number;
    gender: 'erkek' | 'kadın';
    type: 'parent' | 'child';
  }>;
  adults: number;
  children: number;
  lastAidDate: Timestamp | null;
  totalAidCount: number;
  notes: string;
  createdAt: Timestamp;
}
```

### 4. `aid_transactions` - Yardım Kayıtları
```typescript
{
  id: string;
  householdId: string;      // Reference to households
  regionId: string;         // Reference to regions
  volunteerId: string;      // Reference to users (Firebase Auth UID)
  volunteerName: string;
  type: 'food' | 'cash' | 'clothing' | 'other';
  amount: string;           // "1 koli", "500 TL"
  notes: string;
  evidencePhotoUrl: string; // Firebase Storage URL
  date: Timestamp;
  createdAt: Timestamp;
}
```

---

## Trafik Işığı Sistemi

Hanelerin yardım durumunu gösteren renk kodlaması:

| Renk | Durum | Açıklama |
|------|-------|----------|
| 🔴 Kırmızı | Acil | 90+ gün yardım almamış |
| 🟡 Sarı | Bekliyor | 30-90 gün arası |
| 🟢 Yeşil | Güncel | Son 30 gün içinde yardım almış |

---

## Uygulama URL'leri

| Uygulama | URL | Port |
|----------|-----|------|
| Mobile App (Dev) | http://localhost:3000 | 3000 |
| Admin Panel (Dev) | http://localhost:3001 | 3001 |

---

## Firestore Güvenlik Kuralları (Önerilen)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read
    match /{document=**} {
      allow read: if request.auth != null;
    }

    // Only admin can write to users and regions
    match /users/{userId} {
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /regions/{regionId} {
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Volunteers can write to households and aid_transactions in their region
    match /households/{householdId} {
      allow write: if request.auth != null;
    }

    match /aid_transactions/{transactionId} {
      allow write: if request.auth != null;
    }
  }
}
```

---

## Seed Scriptleri

| Script | Açıklama | Kullanım |
|--------|----------|----------|
| `mobile/seed-node.js` | Tüm verileri sıfırlar ve yeniden oluşturur | `node seed-node.js` |
| `mobile/update-admin.js` | Admin kullanıcısını günceller | `node update-admin.js` |
| `mobile/cleanup-seed.html` | Tarayıcıda çalışan temizlik aracı | Tarayıcıda aç |
| `mobile/seed.html` | Tarayıcıda çalışan seed aracı | Tarayıcıda aç |

---

## Bölgeler

### Gebze (12 Mahalle)
1. Sultan Orhan Mah.
2. Adem Yavuz Mah.
3. Atatürk Mah.
4. Barış Mah.
5. Beylikbağı Mah.
6. Cumhuriyet Mah.
7. Güzeller Mah.
8. Hisar Mah.
9. Mevlana Mah.
10. Osman Yılmaz Mah.
11. Pelitli Mah.
12. Sultaniye Mah.

### Darıca (7 Mahalle)
1. Bağlarbaşı Mah.
2. Bayramoğlu Mah.
3. Emek Mah.
4. Osmangazi Mah.
5. Fevzi Çakmak Mah.
6. Nene Hatun Mah.
7. Cami Mah.

---

## Notlar

1. **Soft Delete**: Haneler silinmez, `status: 'archived'` olarak işaretlenir
2. **Phone Normalization**: Telefon numaraları hem orijinal hem normalize edilmiş halde saklanır
3. **Image Compression**: Yardım fotoğrafları yüklemeden önce sıkıştırılır (max 800x800, quality 0.7)
4. **Offline Support**: Firebase offline persistence aktif

---

*Son Güncelleme: 2025-12-27*
