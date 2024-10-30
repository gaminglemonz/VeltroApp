/** @type {import('tailwindcss').Config} */

const { join } = require('path');

module.exports = {
  content: ["./views/templates/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'Poppins': ['Poppins', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}

