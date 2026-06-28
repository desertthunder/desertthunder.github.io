import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig([
	{
		files: ["**/*.{js,mjs,cjs}"],
		plugins: { js, unicorn },
		extends: ["js/recommended", unicorn.configs.recommended],
		languageOptions: { globals: globals.browser },
		rules: { "unicorn/name-replacements": "off" },
	},
]);
