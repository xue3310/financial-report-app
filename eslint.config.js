import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] }, // Abaikan folder dist
  {
    files: ['**/*.{js,jsx}'], // Terapkan ke semua file .js dan .jsx
    languageOptions: {
      ecmaVersion: 2022, // Gunakan versi ECMAScript terbaru
      globals: {
        ...globals.browser, // Tambahkan global browser (seperti `window`, `document`)
        ...globals.node, // Tambahkan global Node.js (jika diperlukan)
      },
      parserOptions: {
        ecmaVersion: 'latest', // Gunakan versi ECMAScript terbaru
        sourceType: 'module', // Gunakan modul ES6
        ecmaFeatures: {
          jsx: true, // Aktifkan dukungan JSX
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks, // Plugin untuk React Hooks
      'react-refresh': reactRefresh, // Plugin untuk React Refresh
    },
    rules: {
      ...js.configs.recommended.rules, // Aturan rekomendasi dari ESLint
      ...reactHooks.configs.recommended.rules, // Aturan rekomendasi untuk React Hooks
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Aturan untuk variabel yang tidak digunakan
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }, // Izinkan ekspor konstanta
      ],
    },
  },
];