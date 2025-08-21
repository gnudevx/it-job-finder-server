import eslintPluginPrettier from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';
import fs from 'node:fs';
import path from 'node:path';

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve('./.prettierrc.json'), 'utf8'),
);

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'off',
      'prettier/prettier': ['error', prettierConfig],
    },
  },
  configPrettier,
];
