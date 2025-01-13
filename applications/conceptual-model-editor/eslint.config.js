import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import stylisticJs from "@stylistic/eslint-plugin-js";

export default tseslint.config({
  ignores: ["dist"],
  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
  ],
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    // Enforces the Rules of Hooks.
    "react-hooks": reactHooks,
    // Validate that your components can safely be updated with fast refresh.
    "react-refresh": reactRefresh,
    // Styles extracted from ESLint core.
    "@stylistic/js": stylisticJs,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    // For now only a warning.
    "@typescript-eslint/no-explicit-any": ["warn"],
    // Use const where possible.
    "prefer-const": ["error", {
      destructuring: "any",
      ignoreReadBeforeAssign: false
    }],
    // No alert or other.
    "no-alert": ["error"],
    // Use === and !==.
    "eqeqeq": ["error"],
    // Comments must start with a capital.
    "capitalized-comments": [
      "error",
      "always",
      { ignoreConsecutiveComments: true },
    ],
    // Using two spaces, we may consider using tabs instead.
    "indent": ["error", 2],
    // Prevent multiple empty lines.
    "no-multiple-empty-lines": [
      "error",
      { "max": 1 }
    ],
    // Files should not be too big.
    "max-lines": [
      "warn",
      { "max": 666, "skipBlankLines": true }
    ],
    // Ignore unused variables and arguments starting with underscore.
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    // Line length, we allow 120 as a compromise.
    "@stylistic/js/max-len": [
      "warn",
      { "code": 120 },
    ],
    // Double quotes.
    "@stylistic/js/quotes": ["error", "double"],
  },
});
