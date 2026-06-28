import { isDefaultLinkCategory } from "./data.js";

export const newCategoryValue = "__new_category__";

/**
 * @param {Element} target
 * @param {unknown[] | unknown} children
 */
export function render(target, children) {
	target.replaceChildren(...toNodes(children));
}

/**
 * @param {import("./data.js").Theme[]} themes
 * @returns {HTMLElement[]}
 */
export function themeOptions(themes) {
	return themes.map((theme) => element("option", { value: theme.id, text: theme.name }));
}

/**
 * @param {import("./data.js").Theme} theme
 * @returns {HTMLElement[]}
 */
export function themeSwatches(theme) {
	return ["base08", "base0A", "base0B", "base0D"].map((key) =>
		element("span", { style: { background: theme.palette[key] } }),
	);
}

/**
 * @param {{label: string}[]} cities
 * @returns {HTMLElement[]}
 */
export function cityOptions(cities) {
	return cities.map((city) => element("option", { value: city.label }));
}

/**
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
		element(
			"button",
			{
				type: "submit",
				className: "icon-button",
				title: `Rename ${category}`,
			},
			[element("i", { className: "i-ri-edit-line" })],
		),
	]);
}

/**
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
 * @param {HTMLElement} node
 * @param {string} key
 * @param {unknown} value
 */
function setProperty(node, key, value) {
	if (value === false || value === null || value === undefined) {
		return;
	}

	if (key === "text") {
		node.textContent = String(value);
	} else if (key === "className") {
		node.className = String(value);
	} else if (key === "dataset" && isObject(value)) {
		for (const [name, dataValue] of Object.entries(value)) {
			node.dataset[name] = String(dataValue);
		}
	} else if (key === "style" && isObject(value)) {
		Object.assign(node.style, value);
	} else {
		node.setAttribute(key, String(value));
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
