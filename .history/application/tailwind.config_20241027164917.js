/** @type {import('tailwindcss').Config} */
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

