/**
 * Formats the clock display in the user's locale.
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatTime = (date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 * Formats the hero date display in the user's locale.
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
