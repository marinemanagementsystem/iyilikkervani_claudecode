/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,ts}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Ana renkler
        'primary': '#13a4ec',
        'primary-dark': '#0f8bc7',

        // Arkaplan renkleri
        'background-light': '#f6f7f8',
        'background-dark': '#101c22',

        // Yüzey renkleri
        'surface-light': '#ffffff',
        'surface-dark': '#1c262c',
        'card-light': '#ffffff',
        'card-dark': '#1c2930',

        // Traffic Light durumları
        'status-red': '#EF4444',
        'status-yellow': '#EAB308',
        'status-green': '#22C55E',

        // Metin renkleri
        'text-secondary-light': '#64748b',
        'text-secondary-dark': '#9db0b9',
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom, 16px)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease forwards',
        'slide-down': 'slideDown 0.3s ease forwards',
        'fade-in': 'fadeIn 0.2s ease forwards',
      },
      keyframes: {
        slideUp: {
          'from': { transform: 'translateY(100%)' },
          'to': { transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { transform: 'translateY(0)' },
          'to': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
