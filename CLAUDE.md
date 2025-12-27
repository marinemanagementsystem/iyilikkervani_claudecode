# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje Genel Bakış

İyilik Kervanı Derneği için geliştirilmiş full-stack dijital platform. İki ana uygulama içerir:
- **Web**: Next.js 15 ile dernek web sitesi ve admin paneli
- **Mobile**: Vite + Alpine.js + Capacitor ile muhtaç hane yönetim sistemi (Android)

## Geliştirme Komutları

### Web Uygulaması (Next.js)
```bash
cd web
npm install
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Mobil Uygulama (Vite + Capacitor)
```bash
cd mobile
npm install
npm run dev          # Vite dev server
npm run build        # www/ klasörüne build
npm run sync         # Capacitor sync
npm run android      # Android Studio aç
npm run build:android  # Full Android APK build
```

### Android APK Build (Manuel)
```bash
cd mobile
npm run build
npx cap sync
cd android
.\gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Mimari

### Web (Next.js 15 + React 18)
```
web/src/
├── app/           # Next.js App Router
│   ├── page.tsx   # Ana sayfa (single-page sections)
│   ├── layout.tsx # Root layout
│   └── admin/     # Admin panel sayfaları
├── components/    # React bileşenleri (Hero, About, Projects, News, Videos, Contact, Footer, Navbar)
└── lib/
    ├── supabase.ts  # Supabase client
    └── types.ts     # TypeScript tipleri (NewsItem, VideoItem, ProjectItem)
```
- **Import alias**: `@/*` -> `./src/*`
- **Styling**: Tailwind CSS
- **Backend**: Supabase (opsiyonel - mock data mode destekli)

### Mobile (Vite + Alpine.js + Firebase)
```
mobile/
├── src/
│   ├── index.html     # SPA ana dosya
│   ├── js/main.js     # Alpine.js stores ve Firebase entegrasyonu
│   └── css/style.css  # Tailwind + custom styles
├── www/               # Build output (webDir)
├── android/           # Capacitor Android projesi
└── capacitor.config.json
```

**Alpine.js Store Yapısı** (main.js):
- `Alpine.store('ui')` - Dark mode, loading, toast, offline state
- `Alpine.store('router')` - SPA navigasyon
- `Alpine.store('auth')` - Firebase Auth, kullanıcı yönetimi
- `Alpine.store('data')` - Households, regions, aid transactions
- `Alpine.store('admin')` - Admin panel: users, regions, statistics
- `Alpine.store('system')` - App version, force update kontrolü

**Sayfalar** (router pages):
- login, admin-dashboard, volunteer-dashboard
- household-list, household-detail, household-form
- add-aid-modal, admin-panel, user-form, region-form
- region-stats, map, profile

### Backend Entegrasyonları

**Firebase** (Mobile):
- Project: `iyilikkernanimobile`
- Auth: Email/Password (username@app.local formatı)
- Firestore: households, regions, users, aid_transactions, system_settings
- Storage: aid_evidence fotoğrafları

**Supabase** (Web):
- Project ref: `wngrqzupzlkxaraxlrky`
- Tablolar: news, videos, projects

## Önemli Yapılandırma Dosyaları

- `web/.env.local` - Supabase credentials (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- `mobile/capacitor.config.json` - App ID: com.iyilikkervani.yonetim
- `mobile/firestore.rules` - Firebase security rules
- `.mcp.json` - MCP server yapılandırması

## Kodlama Kuralları

- Web: TypeScript strict mode, ESLint with next config
- Mobile: ES modules, Alpine.js reactive state management
- Renk paleti: Primary #ba0840, Secondary #2c3e50
- Türkçe UI text ve hata mesajları
