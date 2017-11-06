module.exports = {
  extends: 'airbnb',
  installedESLint: true,
  plugins: [
    'react',
  ],
  parserOptions: {
    sourceType: 'script',
    globalReturn: true,
  },
  rules: {
    strict: ['error', 'function'],
    'spaced-comment': ['error', 'always', {
      exceptions: ['/'],
    }],
    'keyword-spacing': ['error', {
      after: true,
    }],
    'no-use-before-define': ['error', {
      functions: false,
    }],
    'no-unused-vars': ['error', {
      args: 'none',
    }],
    'max-len': ['error', 100, {
      ignoreComments: true,
    }],
    eqeqeq: 1,
    'no-var': 0,
    'space-before-function-paren': 0,
    'prefer-arrow-callback': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'prefer-template': 0,
    'no-restricted-syntax': 0,
    'guard-for-in': 0,
    'object-shorthand': 0,
  },
};
