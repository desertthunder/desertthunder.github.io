import "@fontsource-variable/google-sans";
import { renderStartpage } from "./render.js";
import { createStartpageState } from "./state.js";
import { getWeatherForCity } from "./weather.js";

const root = document.querySelector("#app");

if (!root) {
	throw new Error("Missing #app root element.");
}

renderStartpage(root, createStartpageState({ weatherProvider: getWeatherForCity }));
