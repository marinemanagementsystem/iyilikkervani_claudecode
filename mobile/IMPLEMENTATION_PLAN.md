# İyilik Yönetim Sistemi - UI/UX Redesign Uygulama Planı

## 1. Proje Özeti

**Amaç:** Mevcut uygulamayı tasarım klasöründeki modern UI/UX tasarımlarına göre yeniden yazmak ve Kocaeli Gebze bölgesi için örnek veriler oluşturmak.

**Teknoloji Kararları:**
- Tailwind CSS CDN (dark mode)
- Inter font family
- Material Symbols Outlined icons
- Firebase Auth + Firestore (mevcut)
- Leaflet.js harita (mevcut)

---

## 2. Tasarım Sistemi

### 2.1 Renk Paleti
```
Primary:        #13a4ec (Mavi)
Background:     #101c22 (Koyu)
Surface:        #1c262c (Kart arkaplanı)
Card Dark:      #1c2930

Traffic Light:
- Kırmızı:      #EF4444 (90+ gün yardım almamış)
- Sarı:         #EAB308 (30-90 gün)
- Yeşil:        #22C55E (< 30 gün)

Text:
- Primary:      #ffffff
- Secondary:    #9db0b9
```

### 2.2 Typography
```
Font: Inter (400, 500, 600, 700)
Başlıklar: text-xl, text-2xl, font-bold
Body: text-base, text-sm
Meta: text-xs
```

### 2.3 Spacing & Radius
```
Border Radius: rounded-xl (0.75rem)
Card Padding: p-4, p-5
Gap: gap-3, gap-4
```

---

## 3. Sayfa Yapısı

### 3.1 Login Sayfası
- Hero image (charity görseli)
- Gradient overlay (transparent → background)
- Logo + "İyilik Kervanı" branding
- Username/Password form
- Login button (primary color)

### 3.2 Admin Dashboard
- Top bar: Avatar + isim + notification icon
- Timeframe selector (pills): Bu Ay, Son Çeyrek, Tümü
- Stats kartları (horizontal scroll):
  - Toplam Yardım
  - Ulaşılan Hane
  - Aktif Gönüllü
  - Acil Vakalar
- Regional Fairness Index (bar chart - CSS)
- Quota Fulfillment (progress bars)
- Recent Activity (timeline)
- FAB butonu (+ add)
- Bottom navigation

### 3.3 Volunteer Dashboard
- Top bar: Avatar + isim
- Stats grid (3'lü):
  - Atanan
  - Bekleyen
  - Tamamlanan
- Urgent Aid Required (horizontal carousel)
  - CRITICAL / HIGH PRIORITY badge'leri
- Recent Activity feed
- Bottom navigation

### 3.4 Household List
- Header: Başlık + Add butonu
- Search input
- Filter pills: Tümü, Acil (kırmızı), Beklemede (sarı), Yardım Aldı (yeşil)
- List items:
  - Sol renk strip (traffic light)
  - İsim + badge
  - Telefon
  - Aile sayısı
  - Son yardım tarihi
  - Chevron icon

### 3.5 Household Detail (YENİ SAYFA)
- Back button + Edit link
- Profil kartı:
  - Fotoğraf (avatar)
  - İsim + status badge
  - ID + Verified
  - Lokasyon
- Quick action buttons:
  - Konum İste
  - Ara
  - WhatsApp
- Family Members listesi
- Aid History kartları
- Sticky "Yardım Kaydet" butonu

### 3.6 Add Aid Modal (YENİ)
- Bottom sheet tasarımı
- Handle bar
- Aid Type pills: Gıda, Nakit, Sağlık, Giyim
- Miktar input
- Notlar textarea
- Fotoğraf yükleme alanı
- Tarih bilgisi
- Onayla butonu

### 3.7 Admin Panel
- Header: Başlık + Settings icon
- Segmented tabs: Kullanıcılar / Bölgeler
- Search bar
- User list:
  - Avatar + online indicator
  - İsim + rol
  - Edit/Delete butonları
- FAB (+ ekle)

### 3.8 Map Sayfası
- Leaflet harita (tam ekran)
- Marker'lar traffic light renklerinde
- Popup bilgileri
- Bottom navigation

### 3.9 Profile Sayfası
- Avatar büyük
- İsim + rol
- İstatistikler
- Şifre değiştir
- Çıkış yap

---

## 4. Örnek Gebze Verileri

### 4.1 Bölgeler
```
1. Gebze Merkez
2. Darıca
3. Çayırova
4. Dilovası
5. Tavşanlı
6. Eskihisar
7. Pelitli
8. Güzeller
```

### 4.2 Örnek Haneler (20 adet)
```
ID    İsim                    Bölge           Üye   Durum      Son Yardım
----  ----------------------  --------------  ----  ---------  -----------
1001  Yılmaz Ailesi          Gebze Merkez    5     Acil       Hiç
1002  Öztürk Ailesi          Darıca          4     Beklemede  45 gün
1003  Kaya Ailesi            Çayırova        6     Yardım Aldı 5 gün
1004  Demir Ailesi           Dilovası        3     Acil       120 gün
1005  Şahin Ailesi           Tavşanlı        7     Beklemede  60 gün
1006  Yıldız Ailesi          Eskihisar       4     Yardım Aldı 10 gün
1007  Aydın Ailesi           Pelitli         5     Acil       95 gün
1008  Arslan Ailesi          Güzeller        2     Yardım Aldı 3 gün
1009  Çelik Ailesi           Gebze Merkez    6     Beklemede  35 gün
1010  Koç Ailesi             Darıca          4     Acil       Hiç
1011  Kurt Ailesi            Çayırova        3     Yardım Aldı 15 gün
1012  Özkan Ailesi           Dilovası        5     Beklemede  50 gün
1013  Erdoğan Ailesi         Tavşanlı        8     Acil       100 gün
1014  Aksoy Ailesi           Eskihisar       4     Yardım Aldı 8 gün
1015  Korkmaz Ailesi         Pelitli         6     Beklemede  40 gün
1016  Çetin Ailesi           Güzeller        3     Yardım Aldı 2 gün
1017  Ünal Ailesi            Gebze Merkez    5     Acil       110 gün
1018  Polat Ailesi           Darıca          4     Beklemede  55 gün
1019  Şen Ailesi             Çayırova        7     Yardım Aldı 12 gün
1020  Güneş Ailesi           Dilovası        2     Acil       Hiç
```

### 4.3 Örnek Kullanıcılar
```
Username        Rol         Bölge           Durum
-----------     ---------   -------------   ------
admin           Admin       Tümü            Aktif
ahmet.gonullu   Gönüllü     Gebze Merkez    Aktif
fatma.gonullu   Gönüllü     Darıca          Aktif
mehmet.gonullu  Gönüllü     Çayırova        Aktif
ayse.gonullu    Gönüllü     Dilovası        Aktif
ali.gonullu     Gönüllü     Tavşanlı        Pasif
```

### 4.4 Örnek Yardım İşlemleri
```
Tarih       Hane            Tür     Miktar    Gönüllü
----------  --------------  ------  --------  ---------------
2024-12-25  Kaya Ailesi     Gıda    1 Koli    ahmet.gonullu
2024-12-24  Yıldız Ailesi   Nakit   500 TL    fatma.gonullu
2024-12-23  Arslan Ailesi   Gıda    1 Koli    mehmet.gonullu
2024-12-22  Çetin Ailesi    Giyim   3 Parça   ayse.gonullu
2024-12-20  Kurt Ailesi     Sağlık  İlaç      ahmet.gonullu
2024-12-18  Aksoy Ailesi    Gıda    2 Koli    fatma.gonullu
```

---

## 5. Uygulama Sırası

### Adım 1: Base Setup
- [ ] Tailwind CSS CDN + config
- [ ] Inter font + Material Symbols
- [ ] CSS utilities (hide-scrollbar, fill-1)
- [ ] Dark mode class

### Adım 2: Login Sayfası
- [ ] Hero image section
- [ ] Gradient overlay
- [ ] Logo + branding
- [ ] Form (username/password)
- [ ] Login butonu

### Adım 3: Bottom Navigation
- [ ] Fixed bottom bar
- [ ] 4 tab (rol bazlı)
- [ ] Active/inactive states
- [ ] Safe area padding

### Adım 4: Admin Dashboard
- [ ] Top bar
- [ ] Timeframe pills
- [ ] Stats kartları
- [ ] Regional Fairness chart
- [ ] Quota progress bars
- [ ] Activity timeline
- [ ] FAB butonu

### Adım 5: Volunteer Dashboard
- [ ] Stats grid
- [ ] Urgent carousel
- [ ] Activity feed

### Adım 6: Household List
- [ ] Search input
- [ ] Filter pills
- [ ] List items (traffic light strip)
- [ ] Add butonu

### Adım 7: Household Detail (YENİ)
- [ ] Profil kartı
- [ ] Quick actions
- [ ] Family members
- [ ] Aid history
- [ ] Record aid butonu

### Adım 8: Add Aid Modal (YENİ)
- [ ] Bottom sheet
- [ ] Aid type pills
- [ ] Form fields
- [ ] Submit butonu

### Adım 9: Admin Panel
- [ ] Segmented tabs
- [ ] Users listesi
- [ ] Regions listesi
- [ ] FAB butonu

### Adım 10: Map Sayfası
- [ ] Leaflet styling update
- [ ] Traffic light markers
- [ ] Popup styling

### Adım 11: Profile Sayfası
- [ ] User info
- [ ] Stats
- [ ] Actions

### Adım 12: Firebase Integration
- [ ] Mevcut auth logic'i koru
- [ ] Yeni sayfa navigasyonu
- [ ] Örnek verileri seed et

### Adım 13: Test
- [ ] Tüm sayfaları test et
- [ ] Navigation test
- [ ] Firebase bağlantısı test
- [ ] Responsive test

---

## 6. Dosya Yapısı

```
mobile/
├── www/
│   └── index.html      # Tüm uygulama (tek dosya)
├── tasarım/            # Referans tasarımlar
│   ├── login_screen_1/
│   ├── admin_dashboard/
│   ├── volunteer_dashboard/
│   ├── household_list/
│   ├── household_detail/
│   ├── add_aid_modal/
│   └── admin_panel/
└── IMPLEMENTATION_PLAN.md  # Bu dosya
```

---

## 7. Notlar

### Önemli Kararlar
1. **Tailwind CDN:** Firebase zaten internet gerektirdiği için CDN kullanımı kabul edilebilir
2. **Traffic Light:** List'te sol strip, Detail'da badge (hybrid yaklaşım)
3. **Charts:** CSS Flexbox ile basit bar chart (library kullanmıyoruz)
4. **Bottom Sheet:** CSS transform + JS toggle
5. **Safe Area:** env(safe-area-inset-*) ile iPhone notch desteği

### Riskler
- Tailwind CDN offline çalışmaz (kabul edildi - Firebase de çalışmaz)
- Büyük dosya boyutu (~4000+ satır) - tek dosya gereksinimi nedeniyle

---

## 8. Tahmini Satır Sayısı

| Bölüm | Satır |
|-------|-------|
| Head (CSS, config) | ~200 |
| Login | ~100 |
| Admin Dashboard | ~300 |
| Volunteer Dashboard | ~200 |
| Household List | ~200 |
| Household Detail | ~250 |
| Add Aid Modal | ~150 |
| Admin Panel | ~200 |
| Map | ~150 |
| Profile | ~100 |
| Bottom Nav | ~50 |
| JavaScript | ~1500 |
| **TOPLAM** | **~3200** |

---

**Hazırlayan:** Claude Code
**Tarih:** 2024-12-27
**Versiyon:** 1.0
