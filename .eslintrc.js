module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
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
      // disable rules from base configurations
      'no-console': 'warning',
      'comma-dangle': ['error', {
        functions: 'never'
      }],
  }
}
