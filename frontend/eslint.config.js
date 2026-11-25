// ESLint = enforcement of R-17, R-21, R-32 in CI (US-15-008, US-15-012). Do not weaken these rules in a PR.
import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const HARD_CODED_STYLE = [
  {
    selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b|rgba?\\(|hsla?\\(/]',
    message: 'R-32: không hard-code màu; dùng token --hc-* / class Tailwind của theme.',
  },
  {
    selector: 'TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b|rgba?\\(/]',
    message: 'R-32: không hard-code màu; dùng token --hc-* / class Tailwind của theme.',
  },
  {
    selector: 'Literal[value=/(^|\\s)[a-z:-]+-\\[[^\\]]+\\]/]',
    message: 'R-32: cấm class Tailwind giá trị tùy ý (vd. p-[7px]); dùng token đã khai báo trong theme.',
  },
  {
    selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression",
    message: 'R-32: không dùng style={{...}}; dùng class Tailwind của theme.',
  },
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'R-17: cấm dangerouslySetInnerHTML.',
  },
];

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'src/shared/api/schema.d.ts'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': ['error', ...HARD_CODED_STYLE],
      // R-08 / R-17: never keep tokens or health data in browser storage.
      'no-restricted-globals': [
        'error',
        { name: 'localStorage', message: 'R-17: không lưu dữ liệu trong localStorage.' },
        { name: 'sessionStorage', message: 'R-17: không lưu dữ liệu trong sessionStorage.' },
        { name: 'indexedDB', message: 'R-17: IndexedDB chỉ dùng trong src/shared/pwa (hàng đợi offline).' },
        { name: 'fetch', message: 'R-21: gọi API qua apiClient (src/shared/api) + hook TanStack Query.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'axios', message: 'R-21: dùng apiClient (openapi-fetch).' }],
          patterns: [
            { group: ['@mui/*', 'antd', 'bootstrap', '@chakra-ui/*'], message: 'R-21: cấm thư viện UI khác.' },
            { group: ['redux', '@reduxjs/*', 'mobx'], message: 'R-21: dùng Zustand / TanStack Query.' },
            { group: ['styled-components', '@emotion/*'], message: 'R-21: cấm CSS-in-JS.' },
          ],
        },
      ],
    },
  },
  {
    // Theme is the only place allowed to define raw colors/sizes.
    files: ['src/shared/theme/**'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  {
    files: ['src/shared/api/**', 'src/test/**', '**/*.test.{ts,tsx}', 'e2e/**'],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    files: ['*.config.{js,ts}', 'e2e/**'],
    languageOptions: { globals: globals.node },
  },
);
