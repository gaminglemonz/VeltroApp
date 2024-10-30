/** @type {import('tailwindcss').Config} */

const { join } = require('path');

module.exports = {
  content: [join(__dirname, "./views/templates/**/*.{html,js}")],
  theme: {
    extend: {
      fontFamily: {
        'Poppins': ['Poppins', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}

