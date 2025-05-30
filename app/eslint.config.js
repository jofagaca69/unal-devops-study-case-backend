// eslint.config.js
import js from '@eslint/js';

export default [
  {
    ...js.configs.recommended,
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-var': 'warn',
      'no-unused-vars': 'warn'
    }
  },
  {
    ignores: ['node_modules/**', 'dist/**']
  }
];
