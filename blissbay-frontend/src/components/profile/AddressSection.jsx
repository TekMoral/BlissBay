// AddressSection Component
// File: ./profile/AddressSection.jsx
import { memo } from "react";

const AddressSection = memo(({ address }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Address Information</h3>
      
      {address ? (
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-800">{address.street}</p>
            <p className="text-gray-800">{address.city}, {address.state}</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">No address information provided</p>
      )}
    </div>
  );
});

AddressSection.displayName = 'AddressSection';

export default AddressSection;