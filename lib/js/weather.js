import citiesCsv from "../data/us-cities.csv?raw";

/**
 * @typedef {{name: string, state: string, latitude: number, longitude: number, population: number, label: string}} City
 */

/**
 * Searchable city index loaded from the bundled CSV.
 *
 * @type {City[]}
 */
export const cities = parseCities(citiesCsv);

/**
 * Fetches the nearest National Weather Service forecast for a known city.
 *
 * @param {string} cityName
 * @param {{fetch?: typeof fetch}} [options]
 * @returns {Promise<string>}
 */
export async function getWeatherForCity(cityName, options = {}) {
	const city = findCity(cityName);

	if (!city) {
		return `Select a listed city for weather`;
	}

	const fetcher = options.fetch ?? fetch;
	const point = await getJson(fetcher, `https://api.weather.gov/points/${city.latitude},${city.longitude}`);
	const forecastUrl = point?.properties?.forecast;

	if (!forecastUrl) {
		return `Forecast unavailable for ${city.label}`;
	}

	const forecast = await getJson(fetcher, forecastUrl);
	const period = forecast?.properties?.periods?.[0];

	if (!period) {
		return `Forecast unavailable for ${city.label}`;
	}

	return `${period.shortForecast}, ${period.temperature}°${period.temperatureUnit} in ${city.label}`;
}

/**
 * Finds a city by its full label or city name.
 *
 * @param {string} value
 * @returns {City | undefined}
 */
export function findCity(value) {
	const query = value.trim().toLowerCase();

	if (!query) {
		return void 0;
	}

	return (
		cities.find((city) => city.label.toLowerCase() === query) ??
		cities.find((city) => city.name.toLowerCase() === query)
	);
}

/**
 * Returns city matches for the settings autocomplete.
 *
 * @param {string} query
 * @param {number} [limit]
 * @returns {City[]}
 */
export function getCitySuggestions(query, limit = 12) {
	const value = query.trim().toLowerCase();

	if (!value) {
		return cities.slice(0, limit);
	}

	return cities.filter((city) => city.label.toLowerCase().includes(value)).slice(0, limit);
}

/**
 * Fetches and parses JSON with the NWS geojson accept header.
 *
 * @param {typeof fetch} fetcher
 * @param {string} url
 * @returns {Promise<any>}
 */
async function getJson(fetcher, url) {
	const response = await fetcher(url, { headers: { Accept: "application/geo+json" } });

	if (!response.ok) {
		throw new Error(`Weather request failed: ${response.status}`);
	}

	return response.json();
}

/**
 * Converts the bundled city CSV into typed city records.
 *
 * @param {string} csv
 * @returns {City[]}
 */
function parseCities(csv) {
	const [headers, ...rows] = parseCsv(csv);

	return rows.map((row) => {
		const city = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));

		return {
			name: city.name,
			state: city.state,
			latitude: Number(city.latitude),
			longitude: Number(city.longitude),
			population: Number(city.population),
			label: `${city.name}, ${city.state}`,
		};
	});
}

/**
 * Parses enough CSV for the bundled city list, including quoted commas.
 *
 * @param {string} csv
 * @returns {string[][]}
 */
function parseCsv(csv) {
	/** @type {string[][]} */
	const rows = [];
	/** @type {string[]} */
	let row = [];
	let cell = "";
	let isQuoted = false;

	for (let index = 0; index < csv.length; index += 1) {
		const char = csv[index];
		const next = csv[index + 1];

		if (char === '"' && isQuoted && next === '"') {
			cell += char;
			index += 1;
		} else if (char === '"') {
			isQuoted = !isQuoted;
		} else if (char === "," && !isQuoted) {
			row.push(cell);
			cell = "";
		} else if (char === "\n" && !isQuoted) {
			row.push(cell);
			if (row.some(Boolean)) {
				rows.push(row);
			}
			row = [];
			cell = "";
		} else if (char !== "\r") {
			cell += char;
		}
	}

	if (cell || row.length > 0) {
		row.push(cell);
		rows.push(row);
	}

	return rows;
}
