const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8" role="status">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
  export default LoadingSpinner;