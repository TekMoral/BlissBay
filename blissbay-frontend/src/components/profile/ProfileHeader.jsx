import { memo, useState, useRef } from "react";
import { FiUser, FiUpload } from "react-icons/fi";
import { useClickOutside } from "../../hooks/UseClickoutside";

const ProfileHeader = memo(({ 
  isEditing = false, 
  userData = {}, 
  handleAvatarChange, 
  updateSuccess, 
  error,
  title, // New prop for custom title
  subtitle, // New prop for custom subtitle
  showAvatar = true, // Control avatar visibility
  allowAvatarEdit = true, // Control if avatar can be edited
  variant = "profile", // New prop: "profile" or "register"
  promptRemoveAvatar // For register variant
}) => {
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const avatarOptionsRef = useRef(null);
  const avatarButtonRef = useRef(null);
  
  useClickOutside(
    [avatarOptionsRef, avatarButtonRef],
    showAvatarOptions,
    () => setShowAvatarOptions(false)
  );
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarChange(e);
      setShowAvatarOptions(false);
    }
  };
  
  // Register variant - centered card layout
  if (variant === "register") {
    return (
      <>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          {title || "Create Account"}
        </h2>

        {/* Success message */}
        {updateSuccess && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded">
            {updateSuccess}
          </div>
        )}

        {/* General form error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
            {error}
          </div>
        )}

        {/* Image upload section */}
        {showAvatar && (
          <div className="flex flex-col items-center mb-6">
            {userData.avatar ? (
              <>
                <div className="relative">
                  <img
                    src={userData.avatar}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full object-cover mb-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={promptRemoveAvatar}
                  className="text-red-500 hover:text-red-600 underline text-sm"
                >
                  Remove Image
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                  <FiUser className="h-12 w-12 text-gray-400" />
                </div>
                <label
                  htmlFor="avatar"
                  className="cursor-pointer px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition"
                >
                  Upload Image
                </label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}
      </>
    );
  }
  
  // Default profile variant - blue header with avatar
  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 h-24 sm:h-32 flex items-end">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          {title || (isEditing ? "Edit Profile" : "User Profile")}
        </h1>
        {subtitle && <p className="text-white ml-2 self-end">{subtitle}</p>}
      </div>
      
      {showAvatar && (
        <div className="relative px-4 sm:px-6 -mt-12 sm:-mt-16 mb-6">
          <div className="relative flex justify-center">
            {/* Avatar - Centered properly */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={`${userData.name || 'User'}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
              )}
            </div>
            
            {/* Edit avatar button with options */}
            {isEditing && allowAvatarEdit && handleAvatarChange && (
              <div className="absolute bottom-0 right-0">
                <button 
                  ref={avatarButtonRef}
                  onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                  className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md"
                  aria-label="Change profile picture"
                >
                  <FiUpload className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                {/* Avatar options popup */}
                {showAvatarOptions && (
                  <div 
                    ref={avatarOptionsRef}
                    className="absolute bottom-12 right-0 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10 w-48">
                    <div className="flex flex-col gap-2">
                      {/* Upload option */}
                      <label 
                        htmlFor="avatar-upload" 
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <FiUpload className="text-blue-600" />
                        <span>Upload photo</span>
                        <input 
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notification messages */}
      <div className="mx-4 sm:mx-6 space-y-2">
        {/* Success message */}
        {updateSuccess && (
          <div className="p-3 bg-green-100 text-green-700 border border-green-300 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {updateSuccess}
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </>
  );
});

ProfileHeader.displayName = 'ProfileHeader';

export default ProfileHeader;
