// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import("eslint").Linter.Config} */
const config = {
    overrides: [
        {
            extends: ["plugin:@typescript-eslint/recommended-requiring-type-checking"],
            files: ["*.ts", "*.tsx"],
            parserOptions: {
                project: path.join(__dirname, "tsconfig.json"),
            },
            rules: {
                "@typescript-eslint/no-unnecessary-type-assertion": "off",
                "@typescript-eslint/no-inferrable-types": "off",
                "@typescript-eslint/no-unused-vars": [
                    "warn",
                    {
                        args: "all",
                        argsIgnorePattern: "^_",
                        caughtErrors: "all",
                        caughtErrorsIgnorePattern: "^_",
                        destructuredArrayIgnorePattern: "^_",
                        varsIgnorePattern: "^_",
                        ignoreRestSiblings: true,
                    },
                ],
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
    },
    plugins: ["@typescript-eslint"],
    extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/consistent-type-imports": [
            "warn",
            {
                prefer: "type-imports",
                fixStyle: "inline-type-imports",
            },
        ],
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        "linebreak-style": 0,
    },
};

module.exports = config;
