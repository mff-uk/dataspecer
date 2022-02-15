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
    // Remove unused imports.
    "unused-imports/no-unused-imports": "error",
    // Allow empty private/protected constructors.
    "@typescript-eslint/no-empty-function": ["error", {
      "allow": [
        "private-constructors", "protected-constructors",
      ],
    }],
    // Try to not use this too often.
    "@typescript-eslint/ban-ts-comment": ["warn"],
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
  "overrides": [
    {
      // Update rules only for pure JavaScript files.
      "files": ["*.js"],
      "rules": {
        "@typescript-eslint/explicit-module-boundary-types": "off",
      },
    },
  ],
};
