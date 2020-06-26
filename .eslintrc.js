module.exports = {
	'env': {
		'commonjs': true,
		'es6': true,
		'browser': false,
		'node': true
	},
	'extends': 'eslint:recommended',
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 2018
	},
	'rules': {
		'indent': [
			'off',
			'tab'
		],
		'linebreak-style': [
			'off',
			'windows'
		],
		'quotes': [
			'warn',
			'single'
		],
		'semi': [
			'error',
			'always'
		],
		'no-irregular-whitespace': {
			'skipComments': true,
			"skipRegExps": true,
			"skipTemplates": true
		}


	}
};