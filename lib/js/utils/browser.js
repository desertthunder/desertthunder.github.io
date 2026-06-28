/**
 * Detects the browser family from a user agent string.
 *
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
 * Returns the icon class used for a detected browser.
 *
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
