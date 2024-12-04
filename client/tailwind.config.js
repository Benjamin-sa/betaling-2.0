// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a2a56',
        secondary: '#f44336',
        background: '#f5f5f5',
        text: '#333',
        navBackground: '#ffffff',
        navText: '#333333', // Zorg ervoor dat dit correct is
        cardBackground: '#ffffff',
        cardShadow: 'rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}