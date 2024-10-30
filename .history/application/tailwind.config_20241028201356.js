const { join } = require('path');

module.exports = {
  content: [join(__dirname, 'views/templates/**/*.{js,html,ejs}')],
  theme: {
    extend: {
      fontFamily: {
        'Poppins': ['"Poppins"', 'arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};