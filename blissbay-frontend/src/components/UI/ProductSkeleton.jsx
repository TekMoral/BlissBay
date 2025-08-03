// components/ui/ProductSkeleton.jsx
const ProductSkeleton = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm animate-pulse">
        <div className="h-[280px] bg-gray-200 rounded-t-lg" />
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    );
  };
export default ProductSkeleton;