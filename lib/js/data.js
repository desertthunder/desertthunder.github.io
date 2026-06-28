/**
 * Built-in theme and bookmark data for first-run state.
 *
 * @module data
 */
/**
 * @typedef {"light" | "dark"} ThemeVariant
 * @typedef {"base00" | "base01" | "base02" | "base03" | "base04" | "base05" | "base06" | "base07" | "base08" | "base09" | "base0A" | "base0B" | "base0C" | "base0D" | "base0E" | "base0F"} PaletteKey
 * @typedef {Record<PaletteKey, string>} Palette
 * @typedef {{id: string, family: string, name: string, variant: ThemeVariant, palette: Palette}} Theme
 * @typedef {{name: string, url: string, alt: string, icon?: string}} Bookmark
 * @typedef {Record<string, Bookmark[]>} LinkGroups
 */

/**
 * Available Base16-style theme palettes.
 *
 * @type {Theme[]}
 */
export const themes = [
	{
		id: "rose-pine-moon",
		family: "rose-pine",
		name: "Rose Pine Moon",
		variant: "dark",
		palette: {
			base00: "#191724",
			base01: "#1f1d2e",
			base02: "#26233a",
			base03: "#6e6a86",
			base04: "#908caa",
			base05: "#e0def4",
			base06: "#e0def4",
			base07: "#524f67",
			base08: "#eb6f92",
			base09: "#f6c177",
			base0A: "#ebbcba",
			base0B: "#31748f",
			base0C: "#9ccfd8",
			base0D: "#c4a7e7",
			base0E: "#f6c177",
			base0F: "#524f67",
		},
	},
	{
		id: "rose-pine-dawn",
		family: "rose-pine",
		name: "Rose Pine Dawn",
		variant: "light",
		palette: {
			base00: "#faf4ed",
			base01: "#fffaf3",
			base02: "#f2e9de",
			base03: "#9893a5",
			base04: "#797593",
			base05: "#575279",
			base06: "#575279",
			base07: "#cecacd",
			base08: "#b4637a",
			base09: "#ea9d34",
			base0A: "#d7827e",
			base0B: "#286983",
			base0C: "#56949f",
			base0D: "#907aa9",
			base0E: "#ea9d34",
			base0F: "#cecacd",
		},
	},
	{
		id: "nord",
		family: "nord",
		name: "Nord",
		variant: "dark",
		palette: {
			base00: "#2E3440",
			base01: "#3B4252",
			base02: "#434C5E",
			base03: "#4C566A",
			base04: "#D8DEE9",
			base05: "#E5E9F0",
			base06: "#ECEFF4",
			base07: "#8FBCBB",
			base08: "#BF616A",
			base09: "#D08770",
			base0A: "#EBCB8B",
			base0B: "#A3BE8C",
			base0C: "#88C0D0",
			base0D: "#81A1C1",
			base0E: "#B48EAD",
			base0F: "#5E81AC",
		},
	},
	{
		id: "nord-light",
		family: "nord",
		name: "Nord Light",
		variant: "light",
		palette: {
			base00: "#e5e9f0",
			base01: "#c2d0e7",
			base02: "#b8c5db",
			base03: "#aebacf",
			base04: "#60728c",
			base05: "#2e3440",
			base06: "#3b4252",
			base07: "#29838d",
			base08: "#99324b",
			base09: "#ac4426",
			base0A: "#9a7500",
			base0B: "#4f894c",
			base0C: "#398eac",
			base0D: "#3b6ea8",
			base0E: "#97365b",
			base0F: "#5272af",
		},
	},
	{
		id: "catppuccin-mocha",
		family: "catppuccin",
		name: "Catppuccin Mocha",
		variant: "dark",
		palette: {
			base00: "#1e1e2e",
			base01: "#181825",
			base02: "#313244",
			base03: "#45475a",
			base04: "#585b70",
			base05: "#cdd6f4",
			base06: "#f5e0dc",
			base07: "#b4befe",
			base08: "#f38ba8",
			base09: "#fab387",
			base0A: "#f9e2af",
			base0B: "#a6e3a1",
			base0C: "#94e2d5",
			base0D: "#89b4fa",
			base0E: "#cba6f7",
			base0F: "#f2cdcd",
		},
	},
	{
		id: "catppuccin-latte",
		family: "catppuccin",
		name: "Catppuccin Latte",
		variant: "light",
		palette: {
			base00: "#eff1f5",
			base01: "#e6e9ef",
			base02: "#ccd0da",
			base03: "#bcc0cc",
			base04: "#acb0be",
			base05: "#4c4f69",
			base06: "#dc8a78",
			base07: "#7287fd",
			base08: "#d20f39",
			base09: "#fe640b",
			base0A: "#df8e1d",
			base0B: "#40a02b",
			base0C: "#179299",
			base0D: "#1e66f5",
			base0E: "#8839ef",
			base0F: "#dd7878",
		},
	},
	{
		id: "tokyo-night-dark",
		family: "tokyo-night",
		name: "Tokyo Night Dark",
		variant: "dark",
		palette: {
			base00: "#1A1B26",
			base01: "#16161E",
			base02: "#2F3549",
			base03: "#444B6A",
			base04: "#787C99",
			base05: "#A9B1D6",
			base06: "#CBCCD1",
			base07: "#D5D6DB",
			base08: "#C0CAF5",
			base09: "#A9B1D6",
			base0A: "#0DB9D7",
			base0B: "#9ECE6A",
			base0C: "#B4F9F8",
			base0D: "#2AC3DE",
			base0E: "#BB9AF7",
			base0F: "#F7768E",
		},
	},
	{
		id: "tokyo-night-light",
		family: "tokyo-night",
		name: "Tokyo Night Light",
		variant: "light",
		palette: {
			base00: "#D5D6DB",
			base01: "#CBCCD1",
			base02: "#DFE0E5",
			base03: "#9699A3",
			base04: "#4C505E",
			base05: "#343B59",
			base06: "#1A1B26",
			base07: "#1A1B26",
			base08: "#343B58",
			base09: "#965027",
			base0A: "#166775",
			base0B: "#485E30",
			base0C: "#3E6968",
			base0D: "#34548A",
			base0E: "#5A4A78",
			base0F: "#8C4351",
		},
	},
	{
		id: "gruvbox-dark-hard",
		family: "gruvbox",
		name: "Gruvbox Dark Hard",
		variant: "dark",
		palette: {
			base00: "#1d2021",
			base01: "#3c3836",
			base02: "#504945",
			base03: "#665c54",
			base04: "#bdae93",
			base05: "#d5c4a1",
			base06: "#ebdbb2",
			base07: "#fbf1c7",
			base08: "#fb4934",
			base09: "#fe8019",
			base0A: "#fabd2f",
			base0B: "#b8bb26",
			base0C: "#8ec07c",
			base0D: "#83a598",
			base0E: "#d3869b",
			base0F: "#d65d0e",
		},
	},
	{
		id: "gruvbox-light-hard",
		family: "gruvbox",
		name: "Gruvbox Light Hard",
		variant: "light",
		palette: {
			base00: "#f9f5d7",
			base01: "#ebdbb2",
			base02: "#d5c4a1",
			base03: "#bdae93",
			base04: "#665c54",
			base05: "#504945",
			base06: "#3c3836",
			base07: "#282828",
			base08: "#9d0006",
			base09: "#af3a03",
			base0A: "#b57614",
			base0B: "#79740e",
			base0C: "#427b58",
			base0D: "#076678",
			base0E: "#8f3f71",
			base0F: "#d65d0e",
		},
	},
];

/**
 * Built-in link groups used for first run and reset.
 *
 * @type {LinkGroups}
 */
export const defaultLinks = {
	Meta: [
		{ name: "Garden", url: "https://garden.desertthunder.dev", alt: "Owais' Places", icon: "i-ri-cactus-fill" },
		{ name: "Dev", url: "https://resume.desertthunder.dev", alt: "Owais' Resume", icon: "i-mdi-resume" },
		{ name: "Blog", url: "https://desertthunder.dev", alt: "Desert Thunder", icon: "i-ri-newspaper-fill" },
	],
	Development: [
		{ name: "GitHub", url: "https://github.com", alt: "GitHub", icon: "i-ri-github-fill" },
		{ name: "Tangled", url: "https://tangled.org", alt: "Tangled", icon: "i-devicon-git" },
		{ name: "Codeberg", url: "https://codeberg.org", alt: "Codeberg", icon: "i-simple-icons-codeberg" },
		{
			name: "Hacker News",
			url: "https://news.ycombinator.com",
			alt: "Hacker News",
			icon: "i-simple-icons-ycombinator",
		},
	],
	Reading: [
		{ name: "The Storygraph", url: "https://app.thestorygraph.com", alt: "The Storygraph", icon: "i-ri-book-2-fill" },
		{ name: "Goodreads", url: "https://goodreads.com", alt: "Goodreads", icon: "i-simple-icons-goodreads" },
		{
			name: "Project Gutenberg",
			url: "https://gutenberg.org",
			alt: "Project Gutenberg",
			icon: "i-simple-icons-gutenberg",
		},
		{ name: "Archive.org", url: "https://archive.org", alt: "Archive.org", icon: "i-simple-icons-internetarchive" },
	],
	Social: [
		{ name: "BlueSky", url: "https://bluesky.social", alt: "BlueSky", icon: "i-simple-icons-bluesky" },
		{ name: "Mastodon", url: "https://mastodon.social", alt: "Mastodon", icon: "i-simple-icons-mastodon" },
		{ name: "Reddit", url: "https://reddit.com", alt: "Reddit", icon: "i-ri-reddit-fill" },
	],
	Media: [
		{ name: "YouTube", url: "https://youtube.com", alt: "YouTube", icon: "i-ri-youtube-fill" },
		{ name: "Spotify", url: "https://spotify.com", alt: "Spotify", icon: "i-ri-spotify-fill" },
		{ name: "Netflix", url: "https://netflix.com", alt: "Netflix", icon: "i-ri-netflix-fill" },
		{ name: "Hulu", url: "https://hulu.com", alt: "Hulu", icon: "i-simple-icons-hulu" },
		{ name: "HBO Max", url: "https://hbomax.com", alt: "HBO Max", icon: "i-simple-icons-max" },
		{ name: "Crunchyroll", url: "https://crunchyroll.com", alt: "Crunchyroll", icon: "i-simple-icons-crunchyroll" },
	],
};

/**
 * Returns true when a category belongs to the shipped default set.
 *
 * @param {string} category
 * @returns {boolean}
 */
export function isDefaultLinkCategory(category) {
	return Object.hasOwn(defaultLinks, category);
}
