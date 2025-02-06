import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";
/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: ["./lib/**/*.{html,js}"],
	theme: {
		extend: {},
	},
	plugins: [
		iconsPlugin({
			collections: getIconCollections([
				"ri",
				"devicon",
				"simple-icons",
				"file-icons",
				"mdi",
			]),
		}),
	],
};
