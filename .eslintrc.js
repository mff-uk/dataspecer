module.exports = {
  "root": true,
  "extends": [
    "eslint:recommended",
  ],
  "parserOptions": {
    "ecmaVersion": "2020",
    "sourceType": "module",
  },
  "rules": {
    // Double quotes can be used for JavaScript as well as C-like languages.
    // As a result is it easier to transition between those languages.
    "quotes": ["error", "double"],
    // Sorry users.
    "linebreak-style": ["error", "unix"],
    // While not necessary again, jus for consistency among languages,
    // making it easier to transition.
    "semi": ["error", "always"],
  },
  "env": {
    "browser": true,
    "es2020": true,
    "node": true,
  },
};
