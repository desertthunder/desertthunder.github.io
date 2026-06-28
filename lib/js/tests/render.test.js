import { afterEach, describe, expect, it, vi } from "vitest";
import { renderStartpage } from "../render.js";
import { createStartpageState } from "../state.js";

function createApp() {
    const app = createStartpageState({
        autoStart: false,
        storage: createStorage(),
        clock: () => new Date("2026-06-28T12:30:00"),
        navigator: { userAgent: "Mozilla/5.0 Firefox/120" },
        weatherProvider: vi.fn().mockResolvedValue("Clear in Chicago"),
    });
    const root = document.createElement("div");
    const stop = renderStartpage(root, app);

    document.body.append(root);

    return { app, root, stop };
}

function createStorage() {
    const values = new Map();
    return {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
    };
}

afterEach(() => {
    document.body.replaceChildren();
    document.documentElement.removeAttribute("style");
});

describe("renderStartpage", () => {
    it("renders browser, theme, and default links", () => {
        const { root, stop } = createApp();

        expect(root.querySelector("[data-browser-title]").title).toBe(
            "Firefox",
        );
        expect(root.querySelector("[data-theme-toggle]").title).toBe(
            "Theme: Rose Pine Moon",
        );
        expect(root.textContent).toContain("Hacker News");
        expect(
            document.documentElement.style.getPropertyValue("--theme-base00"),
        ).toBe("#191724");

        stop();
    });

    it("opens and closes the settings sidebar", () => {
        const { root, stop } = createApp();
        const sidebar = root.querySelector("[data-sidebar]");

        root.querySelector('[data-action="toggle-sidebar"]').click();
        expect(sidebar.classList.contains("settings-panel-open")).toBe(true);
        expect(document.body.classList.contains("settings-open")).toBe(true);

        root.querySelector("[data-overlay]").click();
        expect(sidebar.classList.contains("settings-panel-open")).toBe(false);
        expect(document.body.classList.contains("settings-open")).toBe(false);

        stop();
    });

    it("updates city and refreshes rendered weather", async () => {
        const { app, root, stop } = createApp();

        app.actions.refreshWeather = vi.fn();
        const input = root.querySelector("[data-city-input]");
        input.value = "Berlin";
        root.querySelector('[data-action="save-city"]').click();
        app.state.weather.value = "Clear in Berlin";
        app.state.weatherLoading.value = false;

        expect(app.state.city.value).toBe("Berlin");
        expect(app.actions.refreshWeather).toHaveBeenCalled();
        expect(root.querySelector("[data-weather]").textContent).toBe(
            "Clear in Berlin",
        );

        stop();
    });

    it("adds and removes links through the rendered form", () => {
        const { app, root, stop } = createApp();
        const form = root.querySelector("[data-link-form]");

        form.elements.category.value = "Search";
        form.elements.name.value = "Kagi";
        form.elements.url.value = "kagi.com";
        form.dispatchEvent(
            new SubmitEvent("submit", { bubbles: true, cancelable: true }),
        );

        expect(root.textContent).toContain("Kagi");
        expect(app.state.links.value.Search[0].url).toBe("https://kagi.com/");

        root.querySelector('[data-category="Search"][data-index="0"]').click();
        expect(app.state.links.value.Search).toBeUndefined();

        stop();
    });

    it("cycles themes from the toolbar", () => {
        const { app, root, stop } = createApp();

        root.querySelector("[data-theme-toggle]").click();

        expect(app.state.theme.value).toBe("rose-pine-dawn");
        expect(
            document.documentElement.style.getPropertyValue("--theme-base00"),
        ).toBe("#faf4ed");

        stop();
    });
});
