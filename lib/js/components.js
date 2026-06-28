import { isDefaultLinkCategory } from "./data.js";

/** Sentinel option value used when the link form should create a category. */
export const newCategoryValue = "__new_category__";

/**
 * Replaces a DOM target's children with normalized nodes.
 *
 * @param {Element} target
 * @param {unknown[] | unknown} children
 */
export function render(target, children) {
	target.replaceChildren(...toNodes(children));
}

/**
 * Builds theme select options.
 *
 * @param {import("./data.js").Theme[]} themes
 * @returns {HTMLElement[]}
 */
export function themeOptions(themes) {
	return themes.map((theme) => element("option", { value: theme.id, text: theme.name }));
}

/**
 * Builds the compact palette preview for a theme.
 *
 * @param {import("./data.js").Theme} theme
 * @returns {HTMLElement[]}
 */
export function themeSwatches(theme) {
	return ["base08", "base0A", "base0B", "base0D"].map((key) =>
		element("span", { style: { background: theme.palette[key] } }),
	);
}

/**
 * Builds city autocomplete options from search results.
 *
 * @param {{label: string}[]} cities
 * @returns {HTMLElement[]}
 */
export function cityOptions(cities) {
	return cities.map((city) => element("option", { value: city.label }));
}

/**
 * Builds the link category picker, including the create-new option.
 *
 * @param {import("./data.js").LinkGroups} links
 * @returns {HTMLElement[]}
 */
export function linkCategoryOptions(links) {
	return [
		...Object.keys(links).map((category) => element("option", { value: category, text: category })),
		element("option", { value: newCategoryValue, text: "New category" }),
	];
}

/**
 * Builds the read-only start page link sections.
 *
 * @param {import("./data.js").LinkGroups} links
 * @returns {HTMLElement[]}
 */
export function linkSections(links) {
	return Object.entries(links).map(([category, bookmarks]) =>
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
	);
}

/**
 * Builds editable link sections for the settings panel.
 *
 * @param {import("./data.js").LinkGroups} links
 * @returns {HTMLElement[]}
 */
export function editableLinkSections(links) {
	return Object.entries(links).map(([category, bookmarks]) =>
		element("section", { className: "editable-category" }, [
			categoryHeader(category),
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
	);
}

/**
 * @param {string} category
 * @returns {HTMLElement}
 */
function categoryHeader(category) {
	if (isDefaultLinkCategory(category)) {
		return element("h3", { text: category });
	}

	return element("form", { className: "category-rename", dataset: { categoryRenameForm: "", category } }, [
		element("input", { name: "name", value: category, "aria-label": `Rename ${category}` }),
		element("button", { type: "submit", className: "icon-button", title: `Rename ${category}` }, [
			element("i", { className: "i-ri-edit-line" }),
		]),
	]);
}

/**
 * Tiny DOM factory used by the component builders.
 *
 * @param {string} tagName
 * @param {Record<string, unknown>} [props]
 * @param {unknown[] | unknown} [children]
 * @returns {HTMLElement}
 */
function element(tagName, props = {}, children = []) {
	const node = document.createElement(tagName);

	for (const [key, value] of Object.entries(props)) {
		setProperty(node, key, value);
	}

	node.append(...toNodes(children));
	return node;
}

/**
 * Applies the limited property surface the DOM factory supports.
 *
 * @param {HTMLElement} node
 * @param {string} key
 * @param {unknown} value
 */
function setProperty(node, key, value) {
	if ([value].filter(Boolean).length === 0) {
		return;
	}

	switch (key) {
		case "text": {
			node.textContent = String(value);
			break;
		}
		case "className": {
			node.className = String(value);
			break;
		}
		case "dataset": {
			if (isObject(value)) {
				for (const [name, dataValue] of Object.entries(value)) {
					node.dataset[name] = String(dataValue);
				}
			}
			break;
		}
		case "style": {
			if (isObject(value)) {
				Object.assign(node.style, value);
			}
			break;
		}
		default: {
			node.setAttribute(key, String(value));
		}
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
