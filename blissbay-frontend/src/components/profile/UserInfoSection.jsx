// UserInfoSection Component
// File: ./profile/UserInfoSection.jsx
import { memo } from "react";
import { FiMail, FiPhone, FiCalendar } from "react-icons/fi";

const UserInfoSection = memo(({ userData }) => {
  // Format date helper function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b border-gray-200 pb-2">Contact Information</h3>
      
      <div className="flex items-start space-x-3">
        <FiMail className="mt-1 text-blue-500 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-gray-800 break-all">{userData.email}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <FiPhone className="mt-1 text-blue-500 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p className="text-gray-800">{userData.phone || "Not provided"}</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <FiCalendar className="mt-1 text-blue-500 flex-shrink-0" />
        <div>
          <p className="text-sm text-gray-500">Member Since</p>
          <p className="text-gray-800">{formatDate(userData.createdAt)}</p>
        </div>
      </div>
    </div>
  );
});

UserInfoSection.displayName = 'UserInfoSection';

export default UserInfoSection;