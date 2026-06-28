import { describe, expect, it, vi } from "vitest";
import { createStartpageState, signal } from "../state.js";
import { getBrowserName } from "../utils/browser.js";

function createStorage(seed) {
	const values = new Map(seed ? Object.entries(seed) : []);

	return {
		getItem: vi.fn((key) => values.get(key) ?? null),
		setItem: vi.fn((key, value) => values.set(key, value)),
		value(key) {
			return values.get(key);
		},
	};
}

describe("signal", () => {
	it("notifies subscribers when the value changes", () => {
		const count = signal(1);
		const seen = [];

		count.subscribe((value) => seen.push(value));
		count.value = 2;
		count.update((value) => value + 1);

		expect(seen).toEqual([1, 2, 3]);
	});

	it("does not notify subscribers when the value is unchanged", () => {
		const count = signal(1);
		const listener = vi.fn();

		count.subscribe(listener, { immediate: false });
		count.value = 1;

		expect(listener).not.toHaveBeenCalled();
	});
});

describe("createStartpageState", () => {
	it("loads persisted settings and detects the browser", () => {
		const storage = createStorage({
			"startpage:settings": JSON.stringify({ city: "Lisbon", theme: "tokyo-night-dark" }),
		});
		const app = createStartpageState({
			autoStart: false,
			storage,
			navigator: { userAgent: "Mozilla/5.0 Firefox/120" },
		});

		expect(app.state.city.value).toBe("Lisbon");
		expect(app.state.theme.value).toBe("tokyo-night-dark");
		expect(app.state.browser.value.name).toBe("Firefox");
	});

	it("migrates the shipped Custom category to Meta", () => {
		const app = createStartpageState({
			autoStart: false,
			storage: createStorage({
				"startpage:settings": JSON.stringify({
					links: {
						Custom: [{ name: "Garden", url: "https://garden.desertthunder.dev", alt: "Garden" }],
						Development: [],
					},
				}),
			}),
		});

		expect(app.state.links.value.Custom).toBeUndefined();
		expect(app.state.links.value.Meta[0].name).toBe("Garden");
	});

	it("persists city, theme, and link updates", () => {
		const storage = createStorage();
		const app = createStartpageState({ autoStart: false, storage });

		app.actions.setCity("  Tokyo  ");
		app.actions.setTheme("gruvbox-dark-hard");
		app.actions.addLink({ category: "Search", name: "Kagi", url: "kagi.com" });

		const saved = JSON.parse(storage.value("startpage:settings"));

		expect(saved.city).toBe("Tokyo");
		expect(saved.theme).toBe("gruvbox-dark-hard");
		expect(saved.links.Search[0]).toMatchObject({ name: "Kagi", url: "https://kagi.com/" });
	});

	it("resets settings to defaults", () => {
		const storage = createStorage();
		const app = createStartpageState({
			autoStart: false,
			storage,
			weatherProvider: vi.fn().mockResolvedValue("Clear in Austin"),
		});

		app.actions.setCity("Tokyo");
		app.actions.setTheme("catppuccin-mocha");
		app.actions.addLink({ category: "Search", name: "Kagi", url: "kagi.com" });
		app.actions.resetSettings();

		const saved = JSON.parse(storage.value("startpage:settings"));

		expect(app.state.city.value).toBe("Austin");
		expect(app.state.theme.value).toBe("gruvbox-dark-hard");
		expect(app.state.links.value.Search).toBeUndefined();
		expect(app.state.links.value.Meta[0].name).toBe("Garden");
		expect(saved.links.Meta[0].name).toBe("Garden");
	});

	it("toggles to the opposite variant in the same theme family", () => {
		const app = createStartpageState({ autoStart: false, storage: createStorage() });

		app.actions.setTheme("catppuccin-mocha");
		app.actions.toggleThemeVariant();

		expect(app.state.theme.value).toBe("catppuccin-latte");
	});

	it("removes links and drops empty categories", () => {
		const storage = createStorage();
		const app = createStartpageState({ autoStart: false, storage });

		app.actions.addLink({ category: "Temp", name: "Example", url: "example.com" });
		app.actions.removeLink("Temp", 0);

		expect(app.state.links.value.Temp).toBeUndefined();
	});

	it("renames only custom link categories", () => {
		const app = createStartpageState({ autoStart: false, storage: createStorage() });

		app.actions.addLink({ category: "Search", name: "Kagi", url: "kagi.com" });

		expect(app.actions.renameCategory("Development", "Code")).toBe(false);
		expect(app.actions.renameCategory("Search", "Find")).toBe(true);
		expect(app.state.links.value.Development).toBeDefined();
		expect(app.state.links.value.Search).toBeUndefined();
		expect(app.state.links.value.Find[0].name).toBe("Kagi");
	});

	it("ignores stale weather responses", async () => {
		let resolveFirst;
		const app = createStartpageState({
			autoStart: false,
			storage: createStorage(),
			weatherProvider: vi
				.fn()
				.mockImplementationOnce(
					() =>
						new Promise((resolve) => {
							resolveFirst = resolve;
						}),
				)
				.mockResolvedValueOnce("Second forecast"),
		});

		const first = app.actions.refreshWeather();
		const second = app.actions.refreshWeather();
		resolveFirst("First forecast");
		await Promise.all([first, second]);

		expect(app.state.weather.value).toBe("Second forecast");
		expect(app.state.weatherLoading.value).toBe(false);
	});

	it("stops loading when weather refresh fails", async () => {
		const app = createStartpageState({
			autoStart: false,
			storage: createStorage(),
			weatherProvider: vi.fn().mockRejectedValue(new Error("offline")),
		});

		await app.actions.refreshWeather();

		expect(app.state.weather.value).toBe("Forecast unavailable");
		expect(app.state.weatherLoading.value).toBe(false);
	});
});

describe("getBrowserName", () => {
	it("checks Edge before Chrome", () => {
		expect(getBrowserName("Chrome/120 Edg/120")).toBe("Edge");
	});
});
