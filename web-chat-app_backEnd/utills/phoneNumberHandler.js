const { parsePhoneNumberFromString, getCountries } = require('libphonenumber-js');

/**
 * Normalize and validate phone numbers globally.
 * @param {string} phoneNumber - User's phone number input.
 * @param {string} country - Country code (e.g., 'US', 'PK'). Can be inferred if not provided.
 * @returns {string} - Normalized phone number in E.164 format (e.g., +123456789).
 */
function normalizePhoneNumber(phoneNumber, country = null) {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber, country);
  if (!parsedNumber || !parsedNumber.isValid()) {
    throw new Error('Invalid phone number');
  }

  return parsedNumber.format('E.164'); // Returns the number in +<country code> <number> format
}
