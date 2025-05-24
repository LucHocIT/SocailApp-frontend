/**
 * Converts a UTC date string or timestamp to a local date object
 * @param {string|number|Date} utcDate - The UTC date to convert
 * @returns {Date} The local date object
 */
export const convertUtcToLocal = (utcDate) => {
  if (!utcDate) return new Date(); // Return current date if input is invalid
  
  try {
    // Create a Date object from the UTC string/timestamp
    const date = new Date(utcDate);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    // Convert UTC to local
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    return localDate;
  } catch (error) {
    console.error('Error converting date:', error);
    return new Date();
  }
};
