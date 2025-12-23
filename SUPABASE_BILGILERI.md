# 🔐 SUPABASE BAĞLANTI BİLGİLERİ

**ÖNEMLİ**: Bu dosya Supabase bağlantı bilgilerinizi içerir. Bu bilgileri güvenli tutun!

## Proje Bilgileri

- **Proje Adı**: İyilik Kervanı
- **Proje Ref**: `wngrqzupzlkxaraxlrky`
- **Supabase URL**: `https://wngrqzupzlkxaraxlrky.supabase.co`

## API Anahtarı

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZ3JxenVwemxreGFyYXhscmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMzAsImV4cCI6MjA4MjA5MjAzMH0.jDsg7o125ebG68tzz8tOHF8dlkXBXgmkN0B1md30k1c
```

## Dosya Konumları

### Web Projesi
- **Dosya**: `web/.env.local`
- **İçerik**:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://wngrqzupzlkxaraxlrky.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZ3JxenVwemxreGFyYXhscmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMzAsImV4cCI6MjA4MjA5MjAzMH0.jDsg7o125ebG68tzz8tOHF8dlkXBXgmkN0B1md30k1c
  ```

### Mobile Projesi
- **Dosya**: `mobile/constants/Supabase.ts`
- **İçerik**:
  ```typescript
  export const SUPABASE_URL = 'https://wngrqzupzlkxaraxlrky.supabase.co'
  export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZ3JxenVwemxreGFyYXhscmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTYwMzAsImV4cCI6MjA4MjA5MjAzMH0.jDsg7o125ebG68tzz8tOHF8dlkXBXgmkN0B1md30k1c'
  ```

## Supabase Dashboard

https://supabase.com/dashboard/project/wngrqzupzlkxaraxlrky

## MCP Server Yapılandırması

`.mcp.json` dosyasında MCP sunucusu yapılandırılmış:
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=wngrqzupzlkxaraxlrky"
    }
  }
}
```

## Güvenlik Notları

1. ✅ `.env.local` dosyası `.gitignore`'a eklendi (GitHub'a gitmez)
2. ✅ Mobile projesi bilgileri `mobile/constants/Supabase.ts` içinde (Git'e kaydedilir)
3. ✅ Bu dokümantasyon dosyası Git'e kaydedilir
4. ⚠️ Bu dosyayı GitHub'a public yapmayın veya paylaşmayın

## Yedek Alma Tarihi

**Tarih**: 2025-12-24
**Yedekleyen**: Claude Code
