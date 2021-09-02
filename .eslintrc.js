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
    // Remove unused imports.
    "unused-imports/no-unused-imports": "error",
    // Allow empty private/protected constructors.
    "@typescript-eslint/no-empty-function": ["error", {
      "allow": [
        "private-constructors", "protected-constructors",
      ],
    }],
    // We use any a lot now, so there is no point in having the warning on.
    "@typescript-eslint/no-explicit-any": ["off"],
  },
  "plugins": [
    "@typescript-eslint",
    "unused-imports",
    "jest",
  ],
  "env": {
    "jest/globals": true,
    "browser": true,
    "es2020": true,
    "node": true,
  },
};