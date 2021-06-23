module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "es2020",
    "sourceType": "module",
  },
  "rules": {
    "quotes": ["error", "double"],
    "indent": ["error", 2, {"SwitchCase": 1}],
    "comma-dangle": ["error", "always-multiline"],
    "linebreak-style": ["error", "unix"],
    "semi": ["error", "always"],
    // As of now the tests need manual inspection. This should be removed
    // later when we have stable inputs thus we can prepare expected
    // values for the tests.
    "jest/expect-expect": "off",
  },
  "plugins": [
    "@typescript-eslint",
    "jest",
  ],
  "env": {
    "jest/globals": true,
    "browser": true,
    "es2020": true,
    "node": true,
  }
};