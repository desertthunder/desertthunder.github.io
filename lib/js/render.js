import {
	cityOptions,
	editableLinkSections,
	linkCategoryOptions,
	linkSections,
	newCategoryValue,
	render,
	themeOptions,
	themeSwatches,
} from "./components.js";
import { subscribeMany } from "./state.js";
import { getCitySuggestions } from "./weather.js";

/**
 * @typedef {import("./data.js").LinkGroups} LinkGroups
 * @typedef {import("./state.js").StartpageApp} StartpageApp
 * @typedef {import("./state.js").StartpageSignals} StartpageSignals
 */

/**
 * @param {HTMLElement} root
 * @param {StartpageApp} app
 * @returns {() => void}
 */
export function attachApp(root, app) {
	const { state, actions } = app;

	root.innerHTML = `
		<div data-overlay class="overlay is-hidden"></div>
		<aside data-sidebar class="settings-panel" aria-label="Settings" aria-hidden="true">
			<div class="settings-header">
				<h1>Settings</h1>
				<div class="settings-actions">
					<button class="text-button" type="button" data-action="reset-settings">Reset to default</button>
					<button class="icon-button" type="button" data-action="close-sidebar" title="Close sidebar">
						<i class="i-mdi-close"></i>
					</button>
				</div>
			</div>
			<div class="settings-body">
				<section class="settings-section">
					<h2>City</h2>
					<label class="field-label" for="city-input">Local forecast city</label>
					<div class="inline-form">
						<input id="city-input" name="city" autocomplete="address-level2" list="city-options" data-city-input>
						<datalist id="city-options" data-city-options></datalist>
						<button class="text-button" type="button" data-action="save-city">Save</button>
					</div>
				</section>
				<section class="settings-section">
					<h2>Theme</h2>
					<div class="theme-picker">
						<select class="theme-select" data-theme-select aria-label="Theme"></select>
						<span class="theme-swatch" data-theme-swatch aria-hidden="true"></span>
					</div>
				</section>
				<section class="settings-section settings-section-fill">
					<h2>Links</h2>
					<form class="link-form" data-link-form>
						<select name="category" aria-label="Category" data-link-category-select></select>
						<input class="is-hidden" name="newCategory" placeholder="New category" aria-label="New category" data-new-link-category>
						<input name="name" placeholder="Name" aria-label="Name">
						<input name="url" placeholder="URL" aria-label="URL">
						<button class="text-button" type="submit">Add</button>
					</form>
					<div class="link-editor" data-link-editor></div>
				</section>
			</div>
		</aside>
		<div class="app-shell">
			<main class="app-main">
				<nav class="app-nav">
					<h1>Start Page</h1>
					<div class="nav-actions">
						<a href="https://github.com/desertthunder/desertthunder.github.io" target="_blank" rel="noopener" class="icon-link" title="GitHub">
							<i class="i-simple-icons-github"></i>
						</a>
						<button class="icon-button" type="button" data-action="toggle-sidebar">
							<i class="i-ri-settings-3-fill"></i>
						</button>
						<button class="icon-button" type="button" data-action="next-theme" data-theme-toggle>
							<i data-theme-icon></i>
						</button>
					</div>
				</nav>
				<header class="hero-header">
					<section data-browser-title>
						<div class="browser-icon"><i data-browser-icon></i></div>
					</section>
					<section class="local-meta">
						<h1 class="local-time" data-time></h1>
						<p class="app-date" data-date></p>
						<div data-weather-loader>
							<i class="i-ri-loader-2-line spinner-icon"></i>
						</div>
						<h2 data-weather></h2>
					</section>
				</header>
				<section class="links-region" aria-roledescription="links">
					<div class="link-grid" data-links></div>
				</section>
			</main>
			<footer class="site-footer">
				<p>Made with
					<i class="i-mdi-lightning-bolt"></i>
					by
					<a href="https://desertthunder.dev" target="_blank" rel="noopener">Owais</a>
				</p>
			</footer>
		</div>
	`;

	root.addEventListener("click", (event) => {
		const actionTarget = event.target.closest("[data-action]");

		if (!actionTarget) {
			return;
		}

		const action = actionTarget.dataset.action;

		// TODO: this can be a switch..case
		if (action === "toggle-sidebar") actions.toggleSidebar();
		if (action === "close-sidebar") actions.closeSidebar();
		if (action === "save-city") saveCity(root, actions);
		if (action === "next-theme") actions.toggleThemeVariant();
		if (action === "reset-settings") actions.resetSettings();
		if (action === "remove-link") {
			actions.removeLink(actionTarget.dataset.category, Number(actionTarget.dataset.index));
		}
	});

	root.querySelector("[data-overlay]").addEventListener("click", actions.closeSidebar);
	root
		.querySelector("[data-city-input]")
		.addEventListener("input", (event) => renderCityOptions(root, event.currentTarget.value));
	root.querySelector("[data-city-input]").addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			saveCity(root, actions);
		}
	});
	root.querySelector("[data-theme-select]").addEventListener("change", (event) => {
		actions.setTheme(event.currentTarget.value);
	});
	root.querySelector("[data-link-category-select]").addEventListener("change", () => {
		renderNewCategoryField(root);
	});
	root.querySelector("[data-link-form]").addEventListener("submit", (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const values = Object.fromEntries(new FormData(form));
		const added = actions.addLink({
			category: values.category === newCategoryValue ? values.newCategory : values.category,
			name: values.name,
			url: values.url,
		});

		if (added) {
			form.reset();
			renderNewCategoryField(root);
		}
	});
	root.querySelector("[data-link-editor]").addEventListener("submit", (event) => {
		const form = event.target.closest("[data-category-rename-form]");

		if (!form) {
			return;
		}

		event.preventDefault();
		actions.renameCategory(form.dataset.category, form.elements.name.value);
	});
	const closeOnEscape = (event) => {
		if (event.key === "Escape" && state.sidebarOpen.value) {
			actions.closeSidebar();
		}
	};
	document.addEventListener("keydown", closeOnEscape);

	const subscriptions = [
		state.sidebarOpen.subscribe((open) => renderSidebar(root, open)),
		state.theme.subscribe((themeId) => renderTheme(root, state, themeId)),
		state.city.subscribe((city) => {
			renderCity(root, city);
			renderCityOptions(root, city);
		}),
		state.time.subscribe((time) => setText(root, "[data-time]", time)),
		state.date.subscribe((date) => setText(root, "[data-date]", date)),
		state.browser.subscribe((browser) => renderBrowser(root, browser)),
		subscribeMany([state.weather, state.weatherLoading], () => renderWeather(root, state)),
		state.links.subscribe((links) => {
			renderLinks(root, links);
			renderLinkCategorySelect(root, links);
			renderLinkEditor(root, links);
		}),
	];

	return () => {
		for (const stop of subscriptions) {
			stop();
		}

		document.removeEventListener("keydown", closeOnEscape);
	};
}

/**
 * @param {HTMLElement} root
 * @param {boolean} open
 */
function renderSidebar(root, open) {
	const overlay = root.querySelector("[data-overlay]");
	const sidebar = root.querySelector("[data-sidebar]");
	const toggle = root.querySelector('[data-action="toggle-sidebar"]');

	overlay.classList.toggle("is-hidden", !open);
	sidebar.classList.toggle("settings-panel-open", open);
	sidebar.setAttribute("aria-hidden", String(!open));
	document.body.classList.toggle("settings-open", open);
	toggle.title = open ? "Close sidebar" : "Open sidebar";
}

/**
 * @param {HTMLElement} root
 * @param {StartpageSignals} state
 * @param {string} themeId
 */
function renderTheme(root, state, themeId) {
	const theme = state.themes.find((item) => item.id === themeId) ?? state.themes[0];
	const targetTheme = getOppositeTheme(state, theme);
	const button = root.querySelector("[data-theme-toggle]");
	const icon = root.querySelector("[data-theme-icon]");

	for (const [key, color] of Object.entries(theme.palette)) {
		document.documentElement.style.setProperty(`--theme-${key}`, color);
	}

	button.title = `Switch to ${targetTheme.name}`;
	icon.className = targetTheme.variant === "dark" ? "i-ri-moon-fill" : "i-ri-sun-fill";
	renderThemeList(root, state, themeId);
}

/**
 * @param {StartpageSignals} state
 * @param {import("./data.js").Theme} theme
 * @returns {import("./data.js").Theme}
 */
function getOppositeTheme(state, theme) {
	const oppositeVariant = theme.variant === "dark" ? "light" : "dark";
	return state.themes.find((item) => item.family === theme.family && item.variant === oppositeVariant) ?? theme;
}

/**
 * @param {HTMLElement} root
 * @param {StartpageSignals} state
 * @param {string} activeThemeId
 */
function renderThemeList(root, state, activeThemeId) {
	const select = root.querySelector("[data-theme-select]");
	const swatch = root.querySelector("[data-theme-swatch]");
	const activeTheme = state.themes.find((theme) => theme.id === activeThemeId) ?? state.themes[0];

	render(select, themeOptions(state.themes));
	select.value = activeTheme.id;
	render(swatch, themeSwatches(activeTheme));
}

/**
 * @param {HTMLElement} root
 * @param {string} city
 */
function renderCity(root, city) {
	const input = root.querySelector("[data-city-input]");

	if (document.activeElement !== input) {
		input.value = city;
	}
}

/**
 * @param {HTMLElement} root
 * @param {string} query
 */
function renderCityOptions(root, query) {
	render(root.querySelector("[data-city-options]"), cityOptions(getCitySuggestions(query)));
}

/**
 * @param {HTMLElement} root
 * @param {{name: string, icon: string}} browser
 */
function renderBrowser(root, browser) {
	root.querySelector("[data-browser-title]").title = browser.name;
	root.querySelector("[data-browser-icon]").className = browser.icon;
}

/**
 * @param {HTMLElement} root
 * @param {StartpageSignals} state
 */
function renderWeather(root, state) {
	const loading = state.weatherLoading.value;

	root.querySelector("[data-weather-loader]").classList.toggle("is-hidden", !loading);
	setText(root, "[data-weather]", loading ? "" : state.weather.value);
}

/**
 * @param {HTMLElement} root
 * @param {LinkGroups} links
 */
function renderLinks(root, links) {
	render(root.querySelector("[data-links]"), linkSections(links));
}

/**
 * @param {HTMLElement} root
 * @param {LinkGroups} links
 */
function renderLinkCategorySelect(root, links) {
	const select = root.querySelector("[data-link-category-select]");
	const selected = select.value;

	render(select, linkCategoryOptions(links));
	select.value = Object.hasOwn(links, selected) || selected === newCategoryValue ? selected : Object.keys(links)[0];
	renderNewCategoryField(root);
}

/**
 * @param {HTMLElement} root
 */
function renderNewCategoryField(root) {
	const select = root.querySelector("[data-link-category-select]");
	const input = root.querySelector("[data-new-link-category]");
	const creating = select.value === newCategoryValue;

	input.classList.toggle("is-hidden", !creating);
	input.disabled = !creating;
	if (!creating) {
		input.value = "";
	}
}

/**
 * @param {HTMLElement} root
 * @param {LinkGroups} links
 */
function renderLinkEditor(root, links) {
	render(root.querySelector("[data-link-editor]"), editableLinkSections(links));
}

/**
 * @param {HTMLElement} root
 * @param {StartpageApp["actions"]} actions
 */
function saveCity(root, actions) {
	actions.setCity(root.querySelector("[data-city-input]").value);
}

/**
 * @param {HTMLElement} root
 * @param {string} selector
 * @param {string} text
 */
function setText(root, selector, text) {
	root.querySelector(selector).textContent = text;
}
