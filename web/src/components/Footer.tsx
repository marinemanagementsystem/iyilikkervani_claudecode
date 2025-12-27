'use client'

import { Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-display font-bold mb-4">
              İyilik Kervanı
            </h3>
            <p className="text-white/70 leading-relaxed">
              2009&apos;dan beri sosyal yardımlaşma ve dayanışma alanında faaliyet gösteren sivil toplum kuruluşuyuz.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-white/70 hover:text-white transition-colors">
                  Hakkımızda
                </a>
              </li>
              <li>
                <a href="#projects" className="text-white/70 hover:text-white transition-colors">
                  Projeler
                </a>
              </li>
              <li>
                <a href="#news" className="text-white/70 hover:text-white transition-colors">
                  Haberler
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/70 hover:text-white transition-colors">
                  İletişim
                </a>
              </li>
              <li>
                <a href="/yonetim" className="text-white/70 hover:text-white transition-colors">
                  Yönetim
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-white/70">
              <li>Gebze, Kocaeli</li>
              <li>info@iyilikkervani.org</li>
              <li>+90 (XXX) XXX XX XX</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            © {currentYear} İyilik Kervanı Derneği. Tüm hakları saklıdır.
          </p>
          <p className="flex items-center text-white/70 text-sm">
            Made with <Heart className="w-4 h-4 mx-1 text-primary" fill="currentColor" /> for a better world
          </p>
        </div>
      </div>
    </footer>
  )
}
