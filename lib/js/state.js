import { defaultLinks, themes } from "./data.js";

/**
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
 * @typedef {{toggleSidebar(): void, closeSidebar(): void, setTheme(themeId: string): void, setCity(city: string): void, addLink(link: {category: string, name: string, url: string}): boolean, removeLink(category: string, index: number): void, refreshWeather(): Promise<void>, startClock(): () => void}} StartpageActions
 * @typedef {{state: StartpageSignals, actions: StartpageActions}} StartpageApp
 * @typedef {{storage?: StorageLike, timers?: TimerHost, navigator?: {userAgent?: string}, clock?: () => Date, weatherProvider?: (city: string) => Promise<string> | string, autoStart?: boolean}} StartpageOptions
 */

const settingsKey = "startpage:settings";

/** @type {{city: string, theme: string, links: LinkGroups}} */
const defaultSettings = {
    city: "Chicago",
    theme: "rose-pine-moon",
    links: defaultLinks,
};

/**
 * @template T
 * @param {T} initialValue
 * @returns {Signal<T>}
 */
export function signal(initialValue) {
    let value = initialValue;
    /** @type {Set<(value: T) => void>} */
    const subscribers = new Set();

    return {
        get value() {
            return value;
        },
        set value(nextValue) {
            if (Object.is(value, nextValue)) {
                return;
            }

            value = nextValue;
            for (const subscriber of subscribers) {
                subscriber(value);
            }
        },
        update(fn) {
            this.value = fn(value);
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
 * @param {Signal<unknown>[]} signals
 * @param {() => void} fn
 * @returns {() => void}
 */
export function subscribeMany(signals, fn) {
    const unsubscribe = signals.map((item) =>
        item.subscribe(fn, { immediate: false }),
    );
    fn();

    return () => {
        for (const stop of unsubscribe) {
            stop();
        }
    };
}

/**
 * @param {string} [userAgent]
 * @returns {string}
 */
export function getBrowserName(userAgent = "") {
    if (/edg/i.test(userAgent)) return "Edge";
    if (/opr\//i.test(userAgent)) return "Opera";
    if (/firefox|fxios/i.test(userAgent)) return "Firefox";
    if (/chrome|chromium|crios/i.test(userAgent)) return "Chrome";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/trident|msie/i.test(userAgent)) return "Internet Explorer";

    return "Chromium";
}

/**
 * @param {string} name
 * @returns {string}
 */
export function getBrowserIcon(name) {
    /** @type {Record<string, string>} */
    const icons = {
        Chrome: "i-simple-icons-googlechrome",
        Firefox: "i-simple-icons-firefox",
        Safari: "i-simple-icons-safari",
        Opera: "i-simple-icons-opera",
        Edge: "i-simple-icons-microsoftedge",
        "Internet Explorer": "i-simple-icons-internetexplorer",
    };

    return icons[name] ?? icons.Chrome;
}

/**
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
        ((city) =>
            delay(600, timers).then(
                () => `Sunny in ${city} with a high of 75°F`,
            ));
    const settings = loadSettings(storage);

    /** @type {StartpageSignals} */
    const state = {
        themes,
        sidebarOpen: signal(false),
        theme: signal(
            themeExists(settings.theme)
                ? settings.theme
                : defaultSettings.theme,
        ),
        city: signal(settings.city || defaultSettings.city),
        links: signal(settings.links),
        time: signal(formatTime(clock())),
        date: signal(formatDate(clock())),
        weather: signal(""),
        weatherLoading: signal(true),
        browser: signal({
            name: getBrowserName(navigatorRef?.userAgent),
            icon: getBrowserIcon(getBrowserName(navigatorRef?.userAgent)),
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
                    {
                        name: nextName,
                        url: nextUrl,
                        alt: nextName,
                        icon: "i-ri-bookmark-fill",
                    },
                ],
            }));
            save();
            return true;
        },
        removeLink(category, index) {
            state.links.update((links) => {
                const categoryLinks = links[category];

                if (!categoryLinks) {
                    return links;
                }

                const nextCategoryLinks = categoryLinks.filter(
                    (_, itemIndex) => itemIndex !== index,
                );
                const nextLinks = { ...links };

                if (nextCategoryLinks.length) {
                    nextLinks[category] = nextCategoryLinks;
                } else {
                    delete nextLinks[category];
                }

                return nextLinks;
            });
            save();
        },
        refreshWeather() {
            const run = ++weatherRun;
            state.weatherLoading.value = true;

            return Promise.resolve(weatherProvider(state.city.value)).then(
                (weather) => {
                    if (run !== weatherRun) {
                        return;
                    }

                    state.weather.value = weather;
                    state.weatherLoading.value = false;
                },
            );
        },
        startClock() {
            state.time.value = formatTime(clock());
            state.date.value = formatDate(clock());

            const timeId = timers.setInterval(() => {
                state.time.value = formatTime(clock());
            }, 1000);
            const dateId = timers.setInterval(() => {
                state.date.value = formatDate(clock());
            }, 60000);

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
            links: saved?.links ?? structuredClone(defaultSettings.links),
        };
    } catch {
        return structuredClone(defaultSettings);
    }
}

function getDefaultStorage() {
    try {
        return globalThis.localStorage;
    } catch {
        return undefined;
    }
}

function saveSettings(storage, state) {
    if (!storage) {
        return;
    }

    storage.setItem(
        settingsKey,
        JSON.stringify({
            city: state.city.value,
            theme: state.theme.value,
            links: state.links.value,
        }),
    );
}

function themeExists(themeId) {
    return themes.some((theme) => theme.id === themeId);
}

function normalizeUrl(url) {
    if (!url) {
        return "";
    }

    try {
        return new URL(url).toString();
    } catch {
        try {
            return new URL(`https://${url}`).toString();
        } catch {
            return "";
        }
    }
}

function delay(ms, timers) {
    return new Promise((resolve) => timers.setTimeout(resolve, ms));
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(date) {
    return date.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}
