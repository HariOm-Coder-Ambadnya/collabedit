/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        ink: {
          50: '#f5f4f0',
          100: '#e8e5dc',
          200: '#cdc8b8',
          300: '#afa89a',
          400: '#8e8678',
          500: '#6e6659',
          600: '#534e44',
          700: '#3a3731',
          800: '#201e1b',
          900: '#0e0d0b'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.3 } }
      }
    }
  },
  plugins: []
};
