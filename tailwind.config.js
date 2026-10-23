/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,html}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080809',
          black: '#0D0D0F',
          card: '#121215',
          cardHover: '#18181D',
          border: 'rgba(212, 175, 55, 0.2)',
          borderHover: 'rgba(212, 175, 55, 0.5)',
          gold: '#D4AF37',
          goldLight: '#F3E5AB',
          goldChampagne: '#E5C378',
          goldDark: '#997F29',
          muted: '#9E988A',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)',
      }
    },
  },
  plugins: [],
}
