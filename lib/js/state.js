/**
 * Signal-based state machine for start page settings and actions.
 *
 * @module state
 */
import { defaultLinks, isDefaultLinkCategory, themes } from "./data";
import { getBrowserIcon, getBrowserName } from "./utils/browser";
import { formatDate, formatTime } from "./utils/datetime";

/**
 * Minimal reactive value used by the app state machine.
 *
 * @template T
 * @typedef {{value: T, update(fn: (value: T) => T): void, subscribe(fn: (value: T) => void, options?: {immediate?: boolean}): () => void}} Signal
 */

/**
 * @typedef {import("./data.js").LinkGroups} LinkGroups
 * @typedef {import("./data.js").Theme} Theme
 * @typedef {{name: string, icon: string}} BrowserMeta
 * @typedef {{getItem(key: string): string | null, setItem(key: string, value: string): void}} StorageLike
 * @typedef {{setInterval: typeof globalThis.setInterval, clearInterval: typeof globalThis.clearInterval, setTimeout: typeof globalThis.setTimeout}} TimerHost
 * @typedef {{themes: Theme[], sidebarOpen: Signal<boolean>, theme: Signal<string>, city: Signal<string>, links: Signal<LinkGroups>, time: Signal<string>, date: Signal<string>, weather: Signal<string>, weatherLoading: Signal<boolean>, browser: Signal<BrowserMeta>}} StartpageSignals
 * @typedef {{toggleSidebar(): void, closeSidebar(): void, toggleThemeVariant(): void, setTheme(themeId: string): void, setCity(city: string): void, addLink(link: {category: string, name: string, url: string}): boolean, renameCategory(category: string, name: string): boolean, removeLink(category: string, index: number): void, resetSettings(): void, refreshWeather(): Promise<void>, startClock(): () => void}} StartpageActions
 * @typedef {{state: StartpageSignals, actions: StartpageActions}} StartpageApp
 * @typedef {{storage?: StorageLike, timers?: TimerHost, navigator?: {userAgent?: string}, clock?: () => Date, weatherProvider?: (city: string) => Promise<string> | string, autoStart?: boolean}} StartpageOptions
 */

const settingsKey = "startpage:settings";

/** @type {{city: string, theme: string, links: LinkGroups}} */
const defaultSettings = { city: "Austin", theme: "gruvbox-dark-hard", links: defaultLinks };

/**
 * Creates a small synchronous signal with immediate subscriptions by default.
 *
 * @template T
 * @param {T} initialValue
 * @returns {Signal<T>}
 */
export function signal(initialValue) {
	let value = initialValue;
	/** @type {Set<(value: T) => void>} */
	const subscribers = new Set();
	const setValue = (nextValue) => {
		if (Object.is(value, nextValue)) {
			return;
		}

		value = nextValue;
		for (const subscriber of subscribers) {
			subscriber(value);
		}
	};

	return {
		get value() {
			return value;
		},
		set value(nextValue) {
			setValue(nextValue);
		},
		update(fn) {
			setValue(fn(value));
		},
		subscribe(fn, { immediate = true } = {}) {
			subscribers.add(fn);

			if (immediate) {
				fn(value);
			}

			return () => subscribers.delete(fn);
		},
	};
}

/**
 * Subscribes one render effect to multiple signals and returns one cleanup.
 *
 * @param {Signal<unknown>[]} signals
 * @param {() => void} fn
 * @returns {() => void}
 */
export function subscribeMany(signals, fn) {
	const unsubscribe = signals.map((item) => item.subscribe(fn, { immediate: false }));
	fn();

	return () => {
		for (const stop of unsubscribe) {
			stop();
		}
	};
}

/**
 * Builds the start page state machine and its action API.
 *
 * @param {StartpageOptions} [options]
 * @returns {StartpageApp}
 */
export function createStartpageState(options = {}) {
	const storage = options.storage ?? getDefaultStorage();
	const timers = options.timers ?? globalThis;
	const navigatorRef = options.navigator ?? globalThis.navigator;
	const clock = options.clock ?? (() => new Date());
	const weatherProvider =
		options.weatherProvider ??
		(async (city) => {
			await delay(600, timers);
			return `Sunny in ${city} with a high of 75°F`;
		});

	const settings = loadSettings(storage);
	const activeThemeId =
		[settings.theme, defaultSettings.theme].find((themeId) => themeExists(themeId)) ?? defaultSettings.theme;
	const browserName = getBrowserName(navigatorRef?.userAgent);

	/** @type {StartpageSignals} */
	const state = {
		themes,
		sidebarOpen: signal(false),
		theme: signal(activeThemeId),
		city: signal(settings.city || defaultSettings.city),
		links: signal(settings.links),
		time: signal(formatTime(clock())),
		date: signal(formatDate(clock())),
		weather: signal(""),
		weatherLoading: signal(true),
		browser: signal({
			name: browserName,
			icon: getBrowserIcon(browserName),
		}),
	};

	let weatherRun = 0;
	const save = () => saveSettings(storage, state);

	const actions = {
		toggleSidebar() {
			state.sidebarOpen.update((open) => !open);
		},
		closeSidebar() {
			state.sidebarOpen.value = false;
		},
		toggleThemeVariant() {
			actions.setTheme(getOppositeThemeId(state.theme.value));
		},
		setTheme(themeId) {
			if (!themeExists(themeId)) return;
			state.theme.value = themeId;
			save();
		},
		setCity(city) {
			const nextCity = city.trim() || defaultSettings.city;
			state.city.value = nextCity;
			save();
			actions.refreshWeather();
		},
		addLink({ category, name, url }) {
			const nextCategory = category.trim();
			const nextName = name.trim();
			const nextUrl = normalizeUrl(url.trim());

			if (!nextCategory || !nextName || !nextUrl) {
				return false;
			}

			state.links.update((links) => ({
				...links,
				[nextCategory]: [
					...(links[nextCategory] ?? []),
					{ name: nextName, url: nextUrl, alt: nextName, icon: "i-ri-bookmark-fill" },
				],
			}));
			save();
			return true;
		},
		renameCategory(category, name) {
			const currentCategory = category.trim();
			const nextCategory = name.trim();

			if (!currentCategory || !nextCategory || isDefaultLinkCategory(currentCategory)) {
				return false;
			}

			let isRenamed = false;
			state.links.update((links) => {
				if (!Object.hasOwn(links, currentCategory) || Object.hasOwn(links, nextCategory)) {
					return links;
				}

				const nextLinks = {};

				for (const [linkCategory, bookmarks] of Object.entries(links)) {
					nextLinks[linkCategory === currentCategory ? nextCategory : linkCategory] = bookmarks;
				}

				isRenamed = true;
				return nextLinks;
			});
			if (isRenamed) {
				save();
			}
			return isRenamed;
		},
		removeLink(category, index) {
			state.links.update((links) => {
				const categoryLinks = links[category];

				if (!categoryLinks) {
					return links;
				}

				const nextCategoryLinks = categoryLinks.filter((_, itemIndex) => itemIndex !== index);
				const nextLinks = { ...links };

				if (nextCategoryLinks.length > 0) {
					nextLinks[category] = nextCategoryLinks;
				} else {
					delete nextLinks[category];
				}

				return nextLinks;
			});
			save();
		},
		resetSettings() {
			state.city.value = defaultSettings.city;
			state.theme.value = defaultSettings.theme;
			state.links.value = structuredClone(defaultSettings.links);
			save();
			actions.refreshWeather();
		},
		async refreshWeather() {
			const run = ++weatherRun;
			state.weatherLoading.value = true;

			try {
				const weather = await weatherProvider(state.city.value);

				if (run !== weatherRun) {
					return;
				}

				state.weather.value = weather;
			} catch {
				if (run !== weatherRun) {
					return;
				}

				state.weather.value = "Forecast unavailable";
			}

			state.weatherLoading.value = false;
		},
		startClock() {
			state.time.value = formatTime(clock());
			state.date.value = formatDate(clock());

			const timeId = timers.setInterval(() => {
				state.time.value = formatTime(clock());
			}, 1000);

			const dateId = timers.setInterval(() => {
				state.date.value = formatDate(clock());
			}, 60_000);

			return () => {
				timers.clearInterval(timeId);
				timers.clearInterval(dateId);
			};
		},
	};

	if (options.autoStart !== false) {
		actions.startClock();
		actions.refreshWeather();
	}

	return { state, actions };
}

/**
 * Loads saved settings and migrates old link group names.
 *
 * @param {StorageLike | undefined} storage
 * @returns {typeof defaultSettings}
 */
function loadSettings(storage) {
	if (!storage) {
		return structuredClone(defaultSettings);
	}

	try {
		/** @type {Partial<typeof defaultSettings> | null} */
		const saved = JSON.parse(storage.getItem(settingsKey));
		return {
			...structuredClone(defaultSettings),
			...saved,
			links: migrateLinks(saved?.links ?? structuredClone(defaultSettings.links)),
		};
	} catch {
		return structuredClone(defaultSettings);
	}
}

/**
 * @param {LinkGroups} links
 * @returns {LinkGroups}
 */
function migrateLinks(links) {
	if (!links.Custom || links.Meta) {
		return links;
	}

	const { Custom, ...rest } = links;
	return { Meta: Custom, ...rest };
}

/**
 * Returns localStorage when the runtime allows access.
 *
 * @returns {StorageLike | undefined}
 */
function getDefaultStorage() {
	try {
		return localStorage;
	} catch {
		return;
	}
}

/**
 * Persists only user-configurable state.
 *
 * @param {StorageLike | undefined} storage
 * @param {StartpageSignals} state
 */
function saveSettings(storage, state) {
	if (!storage) {
		return;
	}

	storage.setItem(
		settingsKey,
		JSON.stringify({ city: state.city.value, theme: state.theme.value, links: state.links.value }),
	);
}

/** @param {string} themeId */
const themeExists = (themeId) => themes.some((theme) => theme.id === themeId);

/**
 * Returns the matching light/dark variant for the current theme.
 *
 * @param {string} themeId
 * @returns {string}
 */
function getOppositeThemeId(themeId) {
	const theme = themes.find((item) => item.id === themeId);

	if (!theme) {
		return defaultSettings.theme;
	}

	const oppositeVariant = theme.variant === "dark" ? "light" : "dark";
	return themes.find((item) => item.family === theme.family && item.variant === oppositeVariant)?.id ?? theme.id;
}

/**
 * Accepts absolute URLs and bare domains, returning an absolute URL or empty string.
 *
 * @param {string} url
 * @returns {string}
 */
function normalizeUrl(url) {
	if (!url) {
		return "";
	}

	try {
		return new URL(url).href;
	} catch {
		try {
			return new URL(`https://${url}`).href;
		} catch {
			return "";
		}
	}
}

const delay = (ms, timers) => new Promise((resolve) => timers.setTimeout(resolve, ms));
