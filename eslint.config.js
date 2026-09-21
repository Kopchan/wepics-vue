import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.ts', '**/*.vue'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      indent: ['warn', 2],
      semi: ['error', 'never'],
      'no-unused-vars': 'warn',
      'vue/attributes-order': 'off',
      'no-multi-spaces': 'off',
      'vue/no-multi-spaces': 'off',
      'vue/html-closing-bracket-spacing': ['warn', {
        'startTag': 'never',
        'endTag': 'never',
        'selfClosingTag': 'never',
      }],
      // Измените это в блоке rules:
      '@stylistic/comma-dangle': ['warn', {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'always-multiline',
        'exports': 'always-multiline',
        'functions': 'never'
      }],
      'vue/max-attributes-per-line': ['warn', {
        'singleline': { 'max': 3 },
        'multiline': { 'max': 3 },
      }],
      'vue/html-self-closing': ['warn', {
        'html': {
          'void': 'always',
          'normal': 'always',
          'component': 'always',
        },
      }],
      'vue/html-closing-bracket-newline': ['warn', {
        'singleline': 'never',
        'multiline': 'never',
        'selfClosingTag': {
          'singleline': 'never',
          'multiline': 'always',
        }
      }],
      'vue/first-attribute-linebreak': ['warn', {
        'singleline': 'ignore',
        'multiline': 'ignore',
      }],
      'vue/singleline-html-element-content-newline': ['warn', {
        'ignoreWhenNoAttributes': true,
        'ignores': ['pre', 'textarea', 'p', 'span', 'a']
      }],
      'vue/html-indent': ['warn', 2, {
        'attribute': 1,
        'baseIndent': 1,
        'closeBracket': 0,
        'alignAttributesVertically': false,
      }],
    },
  },
  {
    // Настройки для Vue файлов
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    ignores: ['dist/**', '.yarn/**', '.pnp.*', 'node_modules/**'],
  }
);
