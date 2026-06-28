import "@fontsource-variable/hanken-grotesk";
import { renderStartpage } from "./render.js";
import { createStartpageState } from "./state.js";

const root = document.querySelector("#app");

if (!root) {
	throw new Error("Missing #app root element.");
}

renderStartpage(root, createStartpageState());
