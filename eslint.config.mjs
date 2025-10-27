import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import pluginSecurity from 'eslint-plugin-security'
import tseslint from 'typescript-eslint'

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
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			
			// TypeScript правила
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			
			// React Native специфика
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			
			// 🔒 Security правила
			'security/detect-eval-with-expression': 'error',
			'security/detect-unsafe-regex': 'error',
			'security/detect-non-literal-require': 'warn',
			'security/detect-object-injection': 'off', // много false positives в RN
			'security/detect-new-buffer': 'error',
			'security/detect-child-process': 'error',
		},
	}
)

