import Alpine from "alpinejs";
import "@fontsource-variable/hanken-grotesk";

async function timeout(fn, ms) {
	return new Promise((resolve) => {
		if (fn) {
			setTimeout(() => {
				resolve(fn());
			}, ms);
		} else {
			setTimeout(() => {
				resolve();
			}, ms);
		}
	});
}

function getBrowserName() {
	const userAgent = navigator.userAgent;

	if (userAgent.match(/chrome|chromium|crios/i)) {
		return "Chrome";
	}

	if (userAgent.match(/firefox|fxios/i)) {
		return "Firefox";
	}

	if (userAgent.match(/safari/i)) {
		return "Safari";
	}

	if (userAgent.match(/opr\//i)) {
		return "Opera";
	}

	if (userAgent.match(/edg/i)) {
		return "Edge";
	}

	if (userAgent.match(/trident|msie/i)) {
		return "Internet Explorer";
	}

	return "Chromium";
}

function getBrowserIcon(name) {
	switch (name) {
		case "Chrome":
			return '<i class="i-simple-icons-googlechrome"></i>';
		case "Firefox":
			return '<i class="i-simple-icons-firefox"></i>';
		case "Safari":
			return '<i class="i-simple-icons-safari"></i>';
		case "Opera":
			return '<i class="i-simple-icons-opera"></i>';
		case "Edge":
			return '<i class="i-simple-icons-microsoftedge"></i>';
		case "Internet Explorer":
			return '<i class="i-simple-icons-internetexplorer"></i>';
		default:
			return '<i class="i-simple-icons-googlechrome"></i>';
	}
}

/**
 * @type {{[category: string]: Array<{name: string, url: string, alt: string, icon?: string}>}}
 */
const data = {
	Custom: [
		{
			name: "omg.lol",
			url: "https://owais.omg.lol",
			alt: "Owais's Page",
			icon: '<i class="i-ri-heart-2-fill"></i>',
		},
		{
			name: "Blog",
			url: "https://desertthunder.dev",
			alt: "Desert Thunder",
			icon: '<i class="i-ri-newspaper-fill"></i>',
		},
	],
	Development: [
		{
			name: "GitHub",
			url: "https://github.com",
			alt: "GitHub",
			icon: '<i class="i-ri-github-fill"></i>',
		},
		{
			name: "Hacker News",
			url: "https://news.ycombinator.com",
			alt: "Hacker News",
			icon: '<i class="i-simple-icons-ycombinator"></i>',
		},
	],
	// Storygraph, Goodreads, Project Gutenberg, Archive.org
	Reading: [
		{
			name: "The Storygraph",
			url: "https://app.thestorygraph.com",
			alt: "The Storygraph",
			icon: '<i class="i-ri-book-2-fill"></i>',
		},
		{
			name: "Goodreads",
			url: "https://goodreads.com",
			alt: "Goodreads",
			icon: '<i class="i-simple-icons-goodreads"></i>',
		},
		{
			name: "Project Gutenberg",
			url: "https://gutenberg.org",
			alt: "Project Gutenberg",
			icon: '<i class="i-simple-icons-gutenberg"></i>',
		},
		{
			name: "Archive.org",
			url: "https://archive.org",
			alt: "Archive.org",
			icon: '<i class="i-simple-icons-internetarchive"></i>',
		},
	],
	Social: [
		{
			name: "BlueSky",
			url: "https://bluesky.social",
			alt: "BlueSky",
			icon: '<i class="i-simple-icons-bluesky"></i>',
		},
		{
			name: "Mastodon",
			url: "https://mastodon.social",
			alt: "Mastodon",
			icon: '<i class="i-simple-icons-mastodon"></i>',
		},
		{
			name: "Reddit",
			url: "https://reddit.com",
			alt: "Reddit",
			icon: '<i class="i-ri-reddit-fill"></i>',
		},
	],
	Media: [
		{
			name: "YouTube",
			url: "https://youtube.com",
			alt: "YouTube",
			icon: '<i class="i-ri-youtube-fill"></i>',
		},
		{
			name: "Spotify",
			url: "https://spotify.com",
			alt: "Spotify",
			icon: '<i class="i-ri-spotify-fill"></i>',
		},
		{
			name: "Netflix",
			url: "https://netflix.com",
			alt: "Netflix",
			icon: '<i class="i-ri-netflix-fill"></i>',
		},
		{
			name: "Hulu",
			url: "https://hulu.com",
			alt: "Hulu",
			icon: '<i class="i-simpleicons-hulu"></i>',
		},
		{
			name: "HBO Max",
			url: "https://hbomax.com",
			alt: "HBO Max",
			icon: '<i class="i-simpleicons-max"></i>',
		},
		{
			name: "Crunchyroll",
			url: "https://crunchyroll.com",
			alt: "Crunchyroll",
			icon: '<i class="i-simple-icons-crunchyroll"></i>',
		},
	],
};

Alpine.store("sidebar", {
	open: false,
	toggle() {
		this.open = !this.open;
	},
});

Alpine.data("meta", () => ({
	dark: false,
	browser: {
		name: null,
		icon: null,
	},
	toggle() {
		this.dark = !this.dark;
	},
	setTheme(theme) {
		if (theme === "dark") {
			this.dark = true;

			document.querySelector("html").classList.add("dark");

			window.localStorage.setItem("theme", "dark");
		} else {
			this.dark = false;

			document.querySelector("html").classList.remove("dark");

			window.localStorage.setItem("theme", "light");
		}
	},
	init() {
		const current = window.localStorage.getItem("theme");

		if (!current) {
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				this.setTheme("dark");
			} else {
				this.setTheme("light");
			}
		} else {
			this.setTheme(current);
		}

		this.browser.name = getBrowserName();
		this.browser.icon = getBrowserIcon(this.browser.name);

		this.$watch("dark", (value) => {
			if (value) {
				this.setTheme("dark");
			} else {
				this.setTheme("light");
			}
		});
	},
}));

Alpine.data("locals", () => ({
	time: new Date().toLocaleTimeString(),
	date: new Date().toLocaleDateString(),
	weather: null,
	loading: {
		weather: true,
	},
	async getWeather() {
		await timeout(null, 1500);
		await new Promise((resolve) => {
			this.loading.weather = false;
			this.weather = "Sunny with a high of 75°F";
			resolve();
		});
	},
	async init() {
		setInterval(() => {
			this.time = new Date().toLocaleTimeString();
		}, 1000);

		setInterval(() => {
			this.date = new Date().toLocaleDateString();
		}, 60000);

		await this.getWeather();
	},
}));

Alpine.data("links", () => ({
	byCategory: data,
}));

Alpine.start();

window.Alpine = Alpine;

document.addEventListener("keydown", (e) => {
	const store = Alpine.store("sidebar");

	if (e.key === "Escape" && store.open) {
		store.open = false;
	}
});
