import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import pluginSecurity from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'
import reactRefresh from 'eslint-plugin-react-refresh'
import unusedImports from 'eslint-plugin-unused-imports'
import react from 'eslint-plugin-react'

export default tseslint.config(
	{
		ignores: [
			'node_modules',
			'.expo',
			'android',
			'ios',
			'dist',
			'build',
			'*.config.js',
			'babel.config.js',
			'metro.config.js',
		],
	},
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.browser,
				...globals.node,
				__DEV__: 'readonly',
			},
		},
		plugins: {
			'react-hooks': reactHooks,
			security: pluginSecurity,
			'react-refresh': reactRefresh,
			react,
			'unused-imports': unusedImports
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'unused-imports/no-unused-imports': 'warn',
			'unused-imports/no-unused-vars': ['warn', {
				vars: 'all',
				varsIgnorePattern: '^_',
				args: 'after-used',
				argsIgnorePattern: '^_'
			}],
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': ['error', {
				prefer: 'type-imports',
				disallowTypeAnnotations: false,
				fixStyle: 'inline-type-imports'
			}],
			'react/react-in-jsx-scope': 'off',
			'react/display-name': 'error',
			'react/prop-types': 'error',
			'react-hooks/exhaustive-deps': 0,
			'linebreak-style': ['warn', 'unix'],
			'no-console': ['error', { allow: ['warn', 'error'] }],
			'no-empty': 'error',
			'no-unused-labels': 'error',
			'no-debugger': 'error',
			'no-undef': 'error',
			'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
			'semi': ['error', 'never'],
			'quotes': ['error', 'single'],
			'indent': ['error', 4],
			"object-curly-spacing": ["error", "always"]
		},
	}
)

