// Rules applied in this document should be commented in the documentation.
// There you can find reasons and argumentation why, certain rules are used.
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
    "quotes": ["error", "double"],
    "linebreak-style": ["error", "unix"],
    "semi": ["error", "always"],
  },
  "env": {
    "browser": true,
    "es2020": true,
    "node": true,
  },
};
