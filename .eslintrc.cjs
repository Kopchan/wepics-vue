/* eslint-env node */
module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    "indent": ["warn", 2],
    "semi": ["error", "never"],
    "no-unused-vars": "warn",
  },
}
