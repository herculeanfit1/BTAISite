module.exports = {
  parser: 'espree',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  env: {
    node: true,
    es6: true
  },
  globals: {
    console: true,
    process: true
  },
  rules: {
    'no-undef': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'warn'
  }
}; 