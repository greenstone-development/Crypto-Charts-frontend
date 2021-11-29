module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    "no-console": "off",
    // bug in Airbnb config (PR: https://github.com/airbnb/javascript/issues/2505)
    "react/function-component-definition": [
      2,
      {
        namedComponents: "function-declaration",
      },
    ],
    "react/jsx-filename-extension": [0],
  },
};
