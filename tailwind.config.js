/** @type {import('tailwindcss').Config} */
export default {
  content: [
    'src/**/*.tsx'
  ],
  theme: {
    extend: {
      screens: {
        '910': '910px',
        '320': '320px',
        '360': '360px',
        '290': '290px',
      }
    },
  },
  plugins: [],
}

