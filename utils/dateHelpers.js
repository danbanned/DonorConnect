// /lib/dateHelpers.js

/**
 * Formats a date string or Date object into a readable string.
 * @param {string|Date} date - The date to format.
 * @param {string} format - Optional format type: 'short', 'medium', 'long', or custom.
 * @returns {string} Formatted date string.
 */
const dateHelpers = {
  formatDate: (date, format = 'medium') => {
    if (!date) return ''

    const d = date instanceof Date ? date : new Date(date)

    const optionsMap = {
      short: { year: '2-digit', month: 'short', day: 'numeric' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
    }

    const options = optionsMap[format] || optionsMap['medium']

    return d.toLocaleDateString('en-US', options)
  },

  /**
   * Formats a date as a time string, e.g., "3:45 PM"
   */
  formatTime: (date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  },

  /**
   * Formats a date and time together
   */
  formatDateTime: (date, dateFormat = 'medium') => {
    if (!date) return ''
    return `${dateHelpers.formatDate(date, dateFormat)} ${dateHelpers.formatTime(date)}`
  },    
}

export default dateHelpers
