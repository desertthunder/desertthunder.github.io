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
export function renderStartpage(root, app) {
	const { state, actions } = app;

	root.innerHTML = `
		<div data-overlay class="overlay is-hidden"></div>
		<aside data-sidebar class="settings-panel" aria-label="Settings" aria-hidden="true">
			<div class="settings-header">
				<h1>Settings</h1>
				<button class="icon-button" type="button" data-action="close-sidebar" title="Close sidebar">
					<i class="i-mdi-close"></i>
				</button>
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
						<input name="category" placeholder="Category" aria-label="Category">
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
	root.querySelector("[data-link-form]").addEventListener("submit", (event) => {
		event.preventDefault();
		const form = event.currentTarget;
		const added = actions.addLink(Object.fromEntries(new FormData(form)));

		if (added) {
			form.reset();
		}
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

	render(
		select,
		state.themes.map((theme) => element("option", { value: theme.id, text: theme.name })),
	);
	select.value = activeTheme.id;
	render(
		swatch,
		["base08", "base0A", "base0B", "base0D"].map((key) =>
			element("span", { style: { background: activeTheme.palette[key] } }),
		),
	);
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
	render(
		root.querySelector("[data-city-options]"),
		getCitySuggestions(query).map((city) => element("option", { value: city.label })),
	);
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
	render(
		root.querySelector("[data-links]"),
		Object.entries(links).map(([category, bookmarks]) =>
			element("section", { className: "link-category" }, [
				element("h2", { text: category }),
				element(
					"ul",
					{},
					bookmarks.map((bookmark) =>
						element("li", {}, [
							element("a", { href: bookmark.url, target: "_blank", rel: "noopener", title: bookmark.alt }, [
								bookmark.icon && element("i", { className: bookmark.icon }),
								element("span", { text: bookmark.name }),
							]),
						]),
					),
				),
			]),
		),
	);
}

/**
 * @param {HTMLElement} root
 * @param {LinkGroups} links
 */
function renderLinkEditor(root, links) {
	render(
		root.querySelector("[data-link-editor]"),
		Object.entries(links).map(([category, bookmarks]) =>
			element("section", { className: "editable-category" }, [
				element("h3", { text: category }),
				element(
					"ul",
					{},
					bookmarks.map((bookmark, index) =>
						element("li", {}, [
							element("a", { href: bookmark.url, target: "_blank", rel: "noopener", text: bookmark.name }),
							element(
								"button",
								{
									type: "button",
									className: "icon-button",
									dataset: { action: "remove-link", category, index },
									title: `Remove ${bookmark.name}`,
								},
								[element("i", { className: "i-ri-delete-bin-line" })],
							),
						]),
					),
				),
			]),
		),
	);
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

/**
 * @param {Element} target
 * @param {unknown[] | unknown} children
 */
export function render(target, children) {
	target.replaceChildren(...toNodes(children));
}

/**
 * @param {string} tagName
 * @param {Record<string, unknown>} [props]
 * @param {unknown[] | unknown} [children]
 * @returns {HTMLElement}
 */
export function element(tagName, props = {}, children = []) {
	const node = document.createElement(tagName);

	for (const [key, value] of Object.entries(props)) {
		setProperty(node, key, value);
	}

	node.append(...toNodes(children));
	return node;
}

/**
 * @param {HTMLElement} node
 * @param {string} key
 * @param {unknown} value
 */
function setProperty(node, key, value) {
	if (value === false || value === null || value === undefined) {
		return;
	}

	if (key === "text") {
		node.textContent = String(value);
	} else if (key === "className") {
		node.className = String(value);
	} else if (key === "dataset" && isObject(value)) {
		for (const [name, dataValue] of Object.entries(value)) {
			node.dataset[name] = String(dataValue);
		}
	} else if (key === "style" && isObject(value)) {
		Object.assign(node.style, value);
	} else {
		node.setAttribute(key, String(value));
	}
}

/**
 * @param {unknown[] | unknown} value
 * @returns {Node[]}
 */
function toNodes(value) {
	return [value]
		.flat(Infinity)
		.filter((item) => item !== false && item !== null && item !== undefined)
		.map((item) => (item instanceof Node ? item : document.createTextNode(String(item))));
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isObject(value) {
	return typeof value === "object" && value !== null;
}
