/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        offerup: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#00a87e',
          700: '#047857',
          800: '#065f46',
          dark: '#14382c',
        },
        sjsu: {
          blue: '#0055A5',
          gold: '#E5A823',
          darkBlue: '#003366',
          lightBlue: '#E8F1F9',
        }
      }
    },
  },
  plugins: [],
}
