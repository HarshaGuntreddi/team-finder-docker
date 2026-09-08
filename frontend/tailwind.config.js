/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        // Monochrome accent scale (grayscale). Charts use their own colors.
        brand: {
          50: '#f6f6f6',
          100: '#ededed',
          200: '#e0e0e0',
          300: '#c4c4c4',
          400: '#9a9a9a',
          500: '#6b6b6b',
          600: '#404040',
          700: '#2b2b2b',
          800: '#1f1f1f',
          900: '#141414',
          950: '#0a0a0a',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0,0,0,0.08), 0 6px 20px -4px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
