import { describe, expect, it, vi } from "vitest";
import { cities, findCity, getCitySuggestions, getWeatherForCity } from "../weather.js";

describe("weather", () => {
	it("loads the bundled US city dataset", () => {
		expect(cities.length).toBeGreaterThan(900);
		expect(findCity("Austin").label).toBe("Austin, TX");
		expect(getCitySuggestions("chicago")[0].label).toBe("Chicago, IL");
	});

	it("fetches and formats a weather.gov forecast", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({ properties: { forecast: "https://api.weather.gov/gridpoints/EWX/155,90/forecast" } }),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						properties: { periods: [{ shortForecast: "Sunny", temperature: 75, temperatureUnit: "F" }] },
					}),
			});

		await expect(getWeatherForCity("Austin, TX", { fetch: fetcher })).resolves.toBe("Sunny, 75°F in Austin, TX");
		expect(fetcher.mock.calls[0][0]).toBe("https://api.weather.gov/points/30.26715,-97.74306");
	});
});
