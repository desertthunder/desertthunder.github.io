import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
	// Set entry point to lib/index.html
	root: "lib",
	build: {
		outDir: path.resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
	plugins: [tailwindcss()],
});
