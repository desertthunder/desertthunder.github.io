/**
 * Static HTML templates for the app shell.
 *
 * @module templates
 */
/**
 * Returns the static app chrome that render subscriptions hydrate.
 *
 * @returns {string}
 */
export function startpageTemplate() {
	return `
		<div data-overlay class="overlay is-hidden"></div>
		${settingsPanelTemplate()}
		${appShellTemplate()}
	`;
}

/**
 * @returns {string}
 */
function settingsPanelTemplate() {
	return `
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
				${settingsCityTemplate()}
				${settingsThemeTemplate()}
				${settingsLinksTemplate()}
			</div>
		</aside>
	`;
}

/**
 * @returns {string}
 */
function settingsCityTemplate() {
	return `
		<section class="settings-section">
			<h2>City</h2>
			<label class="field-label" for="city-input">Local forecast city</label>
			<div class="inline-form">
				<input id="city-input" name="city" autocomplete="address-level2" list="city-options" data-city-input>
				<datalist id="city-options" data-city-options></datalist>
				<button class="text-button" type="button" data-action="save-city">Save</button>
			</div>
		</section>
	`;
}

/**
 * @returns {string}
 */
function settingsThemeTemplate() {
	return `
		<section class="settings-section">
			<h2>Theme</h2>
			<div class="theme-picker">
				<select class="theme-select" data-theme-select aria-label="Theme"></select>
				<span class="theme-swatch" data-theme-swatch aria-hidden="true"></span>
			</div>
		</section>
	`;
}

/**
 * @returns {string}
 */
function settingsLinksTemplate() {
	return `
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
	`;
}

/**
 * @returns {string}
 */
function appShellTemplate() {
	return `
		<div class="app-shell">
			<main class="app-main">
				${appNavTemplate()}
				${heroTemplate()}
				${linksRegionTemplate()}
			</main>
			${siteFooterTemplate()}
		</div>
	`;
}

/**
 * @returns {string}
 */
function appNavTemplate() {
	return `
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
	`;
}

/**
 * @returns {string}
 */
function heroTemplate() {
	return `
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
	`;
}

/**
 * @returns {string}
 */
function linksRegionTemplate() {
	return `
		<section class="links-region" aria-roledescription="links">
			<div class="link-grid" data-links></div>
		</section>
	`;
}

/**
 * @returns {string}
 */
function siteFooterTemplate() {
	return `
		<footer class="site-footer">
			<p>Made with
				<i class="i-mdi-lightning-bolt"></i>
				by
				<a href="https://desertthunder.dev" target="_blank" rel="noopener">Owais</a>
			</p>
		</footer>
	`;
}
