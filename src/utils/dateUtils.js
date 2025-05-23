/**
 * Converts a UTC date string or timestamp to a local date object
 * @param {string|number|Date} utcDate - The UTC date to convert
 * @returns {Date} The local date object
 */
export const convertUtcToLocal = (utcDate) => {
  // Create a Date object from the UTC string/timestamp
  const date = new Date(utcDate);
  
  // Convert UTC to local
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  
  return localDate;
};
