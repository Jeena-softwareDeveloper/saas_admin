/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ffe9e8',
          100: '#ffd1cf',
          200: '#ffb3b0',
          300: '#ff807d',
          400: '#ff4d4a',
          500: '#D80032',
          600: '#e11955',
          700: '#be0027',
          800: '#9c001f',
          900: '#0b1522',
        },
        footer: {
          bg: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
