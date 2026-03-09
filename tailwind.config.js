/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#000000',
          deep: '#030408',
          card: 'rgba(5, 7, 15, 0.4)',
        },
        celestial: {
          white: '#ffffff',
          light: '#e1e5f2',
          blue: '#1e3a8a',
          glow: 'rgba(255, 255, 255, 0.1)',
        },
      },
      boxShadow: {
        'starlight': '0 0 15px rgba(255,255,255,0.1), 0 0 30px rgba(255,255,255,0.05)',
        'glass': '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 1s ease-out',
        'fade-in-slow': 'fadeIn 2s ease-out',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '0.4' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
