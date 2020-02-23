module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  overrides: [
    {
      files: "**/tests/**/*.spec.(js|jsx|ts|tsx)",
      env: {
        jest: true
      }
    }
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-empty': 'warn',
    'require-atomic-updates': 'warn'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
