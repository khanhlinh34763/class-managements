/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        happy: {
          yellow: '#FFD93D',
          orange: '#FF9F45',
          pink: '#FF6B9D',
          green: '#6BCB77',
          blue: '#4D96FF',
          purple: '#9B72CF',
        },
      },
      fontFamily: {
        sans: ['Baloo 2', 'Quicksand', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}