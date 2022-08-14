/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3e4657',
        secondary: '#272727',
        'dark-subtle': 'rgba(255,255,255,0.5)',
        'light-subtle': 'rgba(39,39,39,0.5)',
        'soft-white': '#dddcda',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            blockquote: {
              borderLeftColor: theme('colors.sky.500'),
            },
            a: {
              color: theme('colors.sky.700'),
            },
          },
        },

        invert: {
          css: {
            color: theme('colors.soft-white'),
            p: {
              color: theme('colors.soft-white'),
            },
            a: {
              color: theme('colors.sky.500'),
            },
            hr: {
              borderColor: theme('colors.soft-white'),
            },
            'li::marker': {
              color: theme('colors.soft-white'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
