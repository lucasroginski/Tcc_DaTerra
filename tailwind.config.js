/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#e8f0eb',
          100: '#cde0d4',
          200: '#a5c9b5',
          300: '#7db296',
          400: '#5c9b77',
          500: '#2E5A44',
          600: '#264836',
          700: '#1f3a2b',
          800: '#172c20',
          900: '#0f1f16',
        },
        honey: {
          50: '#fdf6ed',
          100: '#fbe8d4',
          200: '#f7d4b3',
          300: '#f2bf91',
          400: '#eda96f',
          500: '#D4A373',
          600: '#c48a5a',
          700: '#a36f48',
          800: '#82563a',
          900: '#61402c',
        }
      }
    },
  },
  plugins: [],
}
