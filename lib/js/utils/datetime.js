/**
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatTime = (date) => date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/**
 *
 * @param {Date} date
 * @returns {string}
 */
export const formatDate = (date) => date.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
