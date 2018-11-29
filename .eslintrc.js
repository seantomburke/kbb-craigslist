module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'prettier',
  ],
  plugins: ['prettier'],
  env: {
    browser: true,
    webextensions: true,
    jquery: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    }
  },
  rules: {
    'prettier/prettier': ['error'],
    // disable rules from base configurations
    'no-console': 'warn',
    'comma-dangle': ['error', {
      functions: 'never'
    }],
  }
}
