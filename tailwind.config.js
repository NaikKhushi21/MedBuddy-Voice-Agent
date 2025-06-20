/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF', // main background
        surface: '#FAF7F6',   // lightest white for cards/sidebar
        card: '#F5F3F2',      // slightly darker white for inner cards
        primary: {
          DEFAULT: '#C2185B', // single dark pink for all accents
        },
        text: {
          primary: '#C2185B', // dark pink for headings
          secondary: '#6D4C5B', // muted plum/gray for body
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
} 