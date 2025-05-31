// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        golden: {
          light: '#fdf6e3',
          base: '#d4af37',
          dark: '#a67c00',
        },
      },
      fontFamily: {
        // Your existing Arabic UI font (fallbacks):
        arabic: ['"Amiri"', '"Scheherazade"', 'serif'],

        // NEW: Noto Naskh Arabic for Mushaf (Qur’an text):
        // "Noto Naskh Arabic" must match exactly the Google‐Fonts name
        noto: ['"Noto Naskh Arabic"', 'serif'],
      },
    },
  },
  plugins: [],
};
