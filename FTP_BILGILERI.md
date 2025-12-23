# FTP Sunucu Bilgileri

## İyilik Kervanı Derneği Web Hosting

### Ana FTP Bilgileri

**FTP Sunucusu:** cpanel1.kayizer.com
**IP Adresi:** 85.235.74.127
**Port:** 21
**Kullanıcı Adı:** admin@iyilikkervanidernegi.com
**Şifre:** kk197-xJ

### Alternatif FTP Adresleri (DNS aktif olduğunda çalışacak)
- ftp.iyilikkervanidernegi.com

### Özel FTP Hesabı
**Kullanıcı Adı:** iyilikkervanider
**Ana Dizin:** /home/iyilikkervanider

---

## cPanel Erişim Bilgileri

**URL:** https://cpanel1.kayizer.com:2083/
**Kullanıcı:** admin@iyilikkervanidernegi.com
**Şifre:** kk197-xJ

---

## Sunucu Dizin Yapısı

```
/home/iyilikkervanider/
├── public_html/           # Web sitesi dosyaları buraya yüklenir
│   ├── admin/            # Admin paneli
│   ├── arsiv/            # Arşiv dosyaları
│   ├── arsiv2-15.08.2025/
│   └── test.zip
├── public_ftp/           # Genel FTP dosyaları
├── mail/                 # E-posta dosyaları
├── logs/                 # Log dosyaları
├── ssl/                  # SSL sertifikaları
└── tmp/                  # Geçici dosyalar
```

---

## FTP İstemcisi Önerileri

### Windows için:
- **CoreFTP** - https://www.coreftp.com/
- **FileZilla** - https://filezilla-project.org/

### Mac için:
- **Cyberduck** - https://cyberduck.io/

### Web Tarayıcı ile:
- cPanel Dosya Yöneticisi: https://cpanel1.kayizer.com:2083/

---

## Komut Satırı ile Bağlantı

```bash
# Dizin listeleme
curl --user "admin@iyilikkervanidernegi.com:kk197-xJ" ftp://cpanel1.kayizer.com:21/public_html/

# Dosya yükleme
curl --user "admin@iyilikkervanidernegi.com:kk197-xJ" -T dosya.html ftp://cpanel1.kayizer.com:21/public_html/

# Dosya indirme
curl --user "admin@iyilikkervanidernegi.com:kk197-xJ" ftp://cpanel1.kayizer.com:21/public_html/dosya.html -o dosya.html
```

---

## Önemli Notlar

1. **Web sitesi dosyaları** `public_html/` klasörüne yüklenmelidir
2. **DNS kayıtları** henüz aktif değil - `ftp.iyilikkervanidernegi.com` yerine `cpanel1.kayizer.com` kullanın
3. **Hosting Sağlayıcı:** Kayizer (cpanel1.kayizer.com)
4. **Son Güncelleme:** 24 Aralık 2025

---

## Güvenlik Uyarısı

⚠️ Bu dosya hassas bilgiler içermektedir. Git'e eklerken dikkatli olun!
- Public repository kullanmayın
- .gitignore dosyasına ekleyebilirsiniz
- Şifreleri düzenli olarak değiştirin
