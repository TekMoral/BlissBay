
// ProfileSkeleton Component
// File: ./profile/ProfileSkeleton.jsx
import { memo } from "react";

const ProfileSkeleton = memo(() => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-4xl w-full">
        {/* Header skeleton */}
        <div className="w-full h-24 bg-gray-200 rounded-t-xl animate-pulse mb-6"></div>
        
        {/* Avatar skeleton */}
        <div className="relative -mt-12 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-300 animate-pulse mx-4"></div>
        </div>
        
        {/* Name skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8 animate-pulse"></div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProfileSkeleton.displayName = 'ProfileSkeleton';

export default ProfileSkeleton;