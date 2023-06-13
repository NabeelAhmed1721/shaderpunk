module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:solid/typescript',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:promise/recommended',
		'plugin:tailwindcss/recommended',
		'prettier',
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ['@typescript-eslint', 'solid', 'prettier', 'import'],
	rules: {
		'@typescript-eslint/no-unused-vars': ['error'],
		'prettier/prettier': [
			'error',
			{
				trailingComma: 'all',
				singleQuote: true,
				tabWidth: 4,
				useTabs: true,
				semi: true,
				endOfLine: 'auto',
			},
		],
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
			},
		},
	},
};
