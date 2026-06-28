/**
 * Browser entrypoint that mounts the start page app.
 *
 * @module index
 */
import "@fontsource-variable/google-sans";
import { attachApp } from "./render";
import { createStartpageState } from "./state";
import { getWeatherForCity } from "./weather";

const root = document.querySelector("#app");

if (!root) {
	throw new Error("Missing #app root element.");
}

attachApp(root, createStartpageState({ weatherProvider: getWeatherForCity }));
