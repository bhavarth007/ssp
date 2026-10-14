/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#9b2c2c', // Royal Maroon
          600: '#7b1d1d',
          700: '#5c1414',
          800: '#400c0c',
          900: '#2b0606',
        },
        gold: {
          50: '#fbf9f1',
          100: '#f6f1de',
          200: '#ece1be',
          300: '#e1ce99',
          400: '#d4b76e',
          500: '#c5a044', // Indian Zari Gold
          600: '#ab8333',
          700: '#896429',
          800: '#6f4f25',
          900: '#5c4122',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        'luxury': '0 20px 50px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
