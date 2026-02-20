import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: { 'react-refresh': reactRefresh },
    rules: {
        'react-refresh/only-export-components': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
    }
  }
];
