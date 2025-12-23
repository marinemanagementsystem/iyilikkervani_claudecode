'use client'

import { Heart, Handshake, Globe } from 'lucide-react'

export default function About() {
  const features = [
    {
      icon: <Heart className="w-12 h-12 text-primary" />,
      title: 'Sevgi ile Yaklaşım',
      description: 'Her bireye sevgi ve saygıyla yaklaşıyoruz',
    },
    {
      icon: <Handshake className="w-12 h-12 text-primary" />,
      title: 'Güvenilir Destek',
      description: 'Şeffaf ve güvenilir yardım süreçleri',
    },
    {
      icon: <Globe className="w-12 h-12 text-primary" />,
      title: 'Global Erişim',
      description: 'Dünya çapında yardım ağı',
    },
  ]

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Hakkımızda
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-secondary mt-4 mb-6">
            18 Yıldır İyiliğin Peşinde
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-slide-in-left">
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              İyilik Kervanı Derneği, sosyal yardımlaşmayı ve dayanışmayı teşvik eden bir sivil toplum kuruluşudur.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              15 yıl önce küçük bir kömürlükte başlayan yolculuğumuz, bugün dünya çapında iyilik köprüleri kurarak devam ediyor. Her geçen gün daha fazla ihtiyaç sahibine ulaşıyor, onların hayatlarına dokunuyoruz.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-secondary mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="animate-slide-in-right">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-3xl transform rotate-3" />
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/ekip.jpeg"
                  alt="Hakkımızda"
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
