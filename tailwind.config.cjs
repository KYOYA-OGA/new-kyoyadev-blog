/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Helvetica Neue',
          `Arial`,
          'Hiragino Kaku Gothic ProN',
          'Hiragino Sans',
          `Meiryo`,
          `sans-serif`,
        ],
      },
      colors: {
        primary: '#3e4657',
        secondary: '#272727',
        'dark-subtle': 'rgba(255,255,255,0.5)',
        'light-subtle': 'rgba(39,39,39,0.5)',
        'soft-white': '#dddcda',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
