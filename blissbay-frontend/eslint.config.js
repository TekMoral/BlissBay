import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: globals.browser,
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // not needed in React 17+
    },
  },
  {
    // New override for Node.js backend files:
    files: ["backend/**/*.js", "server/**/*.js", "src/**/*.js", "app.js"], 
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    env: {
      node: true, // Enables node environment (process, __dirname, etc)
    },
    rules: {
      ...js.configs.recommended.rules,
      // optionally disable react rules here if these files don’t have JSX
      "react/react-in-jsx-scope": "off",
    },
  },
]);
