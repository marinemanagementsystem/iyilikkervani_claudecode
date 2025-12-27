/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#13a4ec',
          dark: '#0d7bb3',
          light: '#5bc0f5'
        },
        status: {
          red: '#ef4444',
          yellow: '#f59e0b',
          green: '#22c55e'
        }
      }
    },
  },
  plugins: [],
}
