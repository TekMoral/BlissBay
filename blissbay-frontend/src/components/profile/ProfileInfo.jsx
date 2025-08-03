// ProfileInfo Component
// File: ./profile/ProfileInfo.jsx
import { memo } from "react";
import { FiEdit, FiMail, FiPhone, FiCalendar, FiShield, FiShoppingBag, FiDollarSign, FiClock } from "react-icons/fi";
import UserInfoSection from "./UserInfoSection";
import AddressSection from "./AddressSection";
import AdminSection from "./AdminSection";

const ProfileInfo = memo(({ userData, toggleEditMode, isOwnProfile }) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{userData.name}</h2>
        
        {/* Only show edit button if viewing own profile */}
        {isOwnProfile && (
          <button
            onClick={toggleEditMode}
            className="flex items-center justify-center sm:justify-start bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition w-full sm:w-auto"
          >
            <FiEdit className="mr-2" />
            Edit Profile
          </button>
        )}
      </div>
      
      {/* User information grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserInfoSection userData={userData} />
        <AddressSection address={userData.address} />
      </div>
      
      {/* Admin view section (only visible if admin data exists) */}
      {userData.adminView && (
        <AdminSection adminData={userData.adminView} />
      )}
    </>
  );
});

ProfileInfo.displayName = 'ProfileInfo';

export default ProfileInfo;