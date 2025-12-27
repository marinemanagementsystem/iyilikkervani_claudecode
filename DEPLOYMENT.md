# İyilik Kervanı - Deployment Rehberi

## Build Çıktıları

| Uygulama | Build Komutu | Çıktı Klasörü | Hedef |
|----------|--------------|---------------|-------|
| Web (Next.js) | `cd web && npm run build` | `web/out/` | `public_html/` |
| Yönetim (Vite) | `cd mobile && npm run build` | `mobile/www/` | `public_html/yonetim/` |

## FTP Bağlantı Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Host** | `85.235.74.127` veya `ftp.iyilikkervanidernegi.com` |
| **Kullanıcı** | `admin@iyilikkervanidernegi.com` |
| **Şifre** | `kk197-xJ.` |
| **Port** | `21` |
| **Protokol** | FTP (FTPS destekli) |
| **Giriş Dizini** | `/home/iyilikkervanider` |
| **Web Dizini** | `/home/iyilikkervanider/public_html` |

> **Not:** FileZilla veya benzeri FTP istemcisi ile bağlanabilirsiniz.

## cPanel Bilgileri

| Bilgi | Değer |
|-------|-------|
| **URL** | `https://85.235.74.127:2083` veya hosting panel linki |
| **Kullanıcı** | `iyilikkervanider` |
| **Domain** | `iyilikkervanidernegi.com` |

### SSL Sertifikası Yenileme
1. cPanel'e giriş yap
2. **SSL/TLS Status** menüsüne git
3. **"Run AutoSSL"** butonuna tıkla
4. Birkaç dakika bekle

---

## FTP Deployment Adımları

### 1. Önce Build Alın
```bash
# Web sitesi
cd web
npm run build

# Yönetim paneli (web deployment için base: '/yonetim/' olmalı)
cd ../mobile
npm run build
```

### 2. FTP ile Yükleyin

**Klasör yapısı (cPanel public_html):**
```
public_html/
├── index.html          # Next.js ana sayfa
├── admin/              # Next.js admin panel
│   ├── index.html
│   └── login/
├── _next/              # Next.js assets
├── yonetim/            # Vite yönetim paneli
│   ├── index.html
│   ├── assets/
│   ├── sw.js
│   └── .htaccess       # SPA routing için
├── .htaccess           # Ana site için
└── ... (diğer static dosyalar)
```

**Upload sırası:**
1. `web/out/*` içeriğini → `public_html/` kök dizinine
2. `mobile/www/*` içeriğini → `public_html/yonetim/` klasörüne

### 3. .htaccess Dosyaları

**public_html/.htaccess (Ana site):**
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove .html extension
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.*)$ $1.html [L]

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

**public_html/yonetim/.htaccess (SPA routing):**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /yonetim/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /yonetim/index.html [L]
</IfModule>
```

## Firebase Yapılandırması

### Authorized Domains Ekle
Firebase Console → Authentication → Settings → Authorized domains:
- `iyilikkervanidernegi.com`
- `www.iyilikkervanidernegi.com`

## Önemli Notlar

### Capacitor vs Web Build
`mobile/vite.config.js` dosyasında:
- **Web deployment için:** `base: '/yonetim/'`
- **Capacitor (Android) build için:** `base: './'`

### Supabase (Web sitesi)
Web sitesi Supabase kullanıyor. `.env.local` değişkenleri:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```
> Not: Supabase olmadan mock data mode'da çalışır.

## Hızlı Deployment Script (Opsiyonel)

```bash
#!/bin/bash
# deploy.sh

echo "Building web..."
cd web && npm run build

echo "Building yonetim panel..."
cd ../mobile && npm run build

echo "Build complete! Upload these folders via FTP:"
echo "  - web/out/* → public_html/"
echo "  - mobile/www/* → public_html/yonetim/"
```

## Site Linkleri

- Ana site: https://iyilikkervanidernegi.com
- Admin panel: https://iyilikkervanidernegi.com/admin
- Yönetim paneli: https://iyilikkervanidernegi.com/yonetim
