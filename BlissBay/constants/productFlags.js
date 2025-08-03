/**
 * Product flag constants
 * Used for consistent flag naming across the application
 */
export const PRODUCT_FLAGS = [
  'isFeatured',
  'isPopular',
  'isNewArrival',
  'isBestSeller',
  'isTrending',
  'isHotDeal',
  'isLimitedOffer',
  'isFlashSale',
  'isBackInStock',
  'isExclusive',
  'isCoupon',
  'isLowStock',
  'isFreeShipping'
];

/**
 * Generate an object with all flags set to false
 * @returns {Object} Object with all flags initialized to false
 */
export const getDefaultProductFlags = () => {
  return PRODUCT_FLAGS.reduce((flags, flag) => {
    flags[flag] = false;
    return flags;
  }, {});
};

/**
 * Extract flag values from request body
 * @param {Object} body - Request body
 * @returns {Object} Object containing only the flag properties
 */
export const extractProductFlags = (body) => {
  return PRODUCT_FLAGS.reduce((flags, flag) => {
    if (body[flag] !== undefined) {
      flags[flag] = body[flag];
    }
    return flags;
  }, {});
};

export default {
  PRODUCT_FLAGS,
  getDefaultProductFlags,
  extractProductFlags
};