/**
 * PostCSS Configuration for Tailwind CSS v4 (CommonJS)
 * This version resolves ES module conflicts in the dev environment
 */
/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
