const { join } = require('path');

module.exports = {
  content: [join(__dirname, 'views/**/*.{js,ts,jsx,tsx}')],
  theme: {
    extend: {},
  },
  plugins: [],
};