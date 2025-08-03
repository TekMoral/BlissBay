import React from 'react';

// Product flag definitions
export const productFlags = [
  { id: 'isFeatured', label: 'Featured Product' },
  { id: 'isPopular', label: 'Popular Product' },
  { id: 'isNewArrival', label: 'New Arrival' },
  { id: 'isBestSeller', label: 'Best Seller' },
  { id: 'isTrending', label: 'Trending' },
  { id: 'isHotDeal', label: 'Hot Deal' },
  { id: 'isLimitedOffer', label: 'Limited Time Offer' },
  { id: 'isFlashSale', label: 'Flash Sale' },
  { id: 'isBackInStock', label: 'Back In Stock' },
  { id: 'isExclusive', label: 'Exclusive' },
  { id: 'isCoupon', label: 'Coupon Available' },
  { id: 'isLowStock', label: 'Low Stock' },
  { id: 'isFreeShipping', label: 'Free Shipping' }
  // Add more flags here as needed
];

const ProductFlagSelector = ({ flags, onChange, disabled = false }) => {
  const handleFlagChange = (flagId, checked) => {
    onChange({ ...flags, [flagId]: checked });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Product Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productFlags.map(flag => (
          <div key={flag.id} className="flex items-center">
            <input
              type="checkbox"
              id={flag.id}
              name={flag.id}
              checked={flags[flag.id] || false}
              onChange={(e) => handleFlagChange(flag.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={disabled}
            />
            <label htmlFor={flag.id} className="ml-2 text-sm text-gray-700">
              {flag.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFlagSelector;