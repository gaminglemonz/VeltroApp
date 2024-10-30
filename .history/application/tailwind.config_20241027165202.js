const { join } = require('path');

module.exports = {
  content: [join(__dirname, 'views/templates/**/*.{js,ts,jsx,tsx,ejs}')],
  theme: {
    extend: {},
  },
  plugins: [],
};