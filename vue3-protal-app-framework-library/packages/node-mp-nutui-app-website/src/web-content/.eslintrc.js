module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@typescript-eslint/parser',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    'no-debugger': 'off',
    'vue/no-setup-props-destructure': 'off',
    'no-unsafe-optional-chaining': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/prefer-optional-chain': 'off',
    'prefer-const': 2,
    'no-console': 'off',
    quotes: [1, 'single'],
    'space-in-parens': [2, 'never'],
    semi: [2, 'always'],
    'semi-spacing': [2, {before: false, after: true}],
    'max-len': [
      1,
      {
        code: 140,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreTemplateLiterals: true
      }
    ],
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  },
};
