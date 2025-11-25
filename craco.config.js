const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@models': path.resolve(__dirname, 'src/models'),
    },
  },
};
