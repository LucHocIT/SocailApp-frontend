/**
 * Safely parses a date string or timestamp to a Date object
 * Since backend now returns DateTime.Now (local time), no UTC conversion needed
 * @param {string|number|Date} dateValue - The date to parse
 * @returns {Date} The parsed date object
 */
export const parseDate = (dateValue) => {
  if (!dateValue) return new Date(); // Return current date if input is invalid
  
  try {
    // Create a Date object from the date string/timestamp
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};

/**
 * @deprecated Use parseDate instead. Backend now returns local time.
 * Legacy function kept for compatibility - now just calls parseDate
 */
export const convertUtcToLocal = (dateValue) => {
  console.warn('convertUtcToLocal is deprecated. Use parseDate instead as backend now returns local time.');
  return parseDate(dateValue);
};
