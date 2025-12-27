import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  // Kaynak dosyaların yeri
  root: 'src',

  // WEB DEPLOYMENT: /yonetim/ subdirectory için
  // Capacitor build için bu değeri './' yapın
  base: '/yonetim/',

  // Statik dosyalar
  publicDir: '../public',

  build: {
    // Çıktı klasörü: Capacitor'ın www klasörü
    outDir: '../www',
    // Her build'de klasörü temizle
    emptyOutDir: true,
    // JS ve CSS dosyalarını assets içine al
    assetsDir: 'assets',
    // Production için minify
    minify: 'esbuild',
    // Sourcemap (debug için)
    sourcemap: false,
  },

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Firebase ve harici API'leri cache'leme
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 yıl
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'İyilik Kervanı',
        short_name: 'İyilik',
        description: 'Muhtaç Hane Takip Sistemi',
        theme_color: '#13a4ec',
        background_color: '#101c22',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 3000,
    open: true,
    host: true
  }
});
