

// components/product/ProductFilters.jsx
const ProductFilters = ({ filters, categories = [], onFilterChange, isLoading = false }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Category Filter */}
        <div className="flex-1">
          <select
            id="category-select"
            value={filters.category}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="all">
              {isLoading ? "Loading categories..." : "All Categories"}
            </option>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="flex-1">
          <select
            id="price-range-select"
            value={filters.priceRange}
            onChange={(e) => onFilterChange("priceRange", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="all">All Prices</option>
            <option value="0-50">Under $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200+">$200 & Above</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex-none">
          <button
            onClick={() => {
              onFilterChange("category", "all");
              onFilterChange("priceRange", "all");
            }}
            className="w-full md:w-auto px-6 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            disabled={isLoading || (filters.category === "all" && filters.priceRange === "all")}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;

