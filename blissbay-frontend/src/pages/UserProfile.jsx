import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import ProfileInfo from "../components/profile/ProfileInfo";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";
import ErrorDisplay from "../components/errors/ErrorDisplay";
import { statesList } from "../utils/locationData";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Memoized fetch function to avoid recreating on every render
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the ID from params or fetch current user's profile
      const endpoint = id ? `/api/users/profile/${id}` : "/api/users/profile";
      const response = await axiosInstance.get(endpoint);
      
      if (response.data.success) {
        setUserData(response.data.data);
        
        // Initialize editable data
        setEditableData({
          name: response.data.data.name || "",
          phone: response.data.data.phone || "",
          street: response.data.data.address?.street || "",
          city: response.data.data.address?.city || "",
          state: response.data.data.address?.state || "",
        });
      } else {
        setError("Failed to load profile data");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 403) {
        setError("You are not authorized to view this profile");
      } else if (err.response?.status === 404) {
        setError("User profile not found");
      } else {
        setError("An error occurred while loading the profile");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch user profile on component mount or when ID changes
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Handle edit mode toggle - memoized to prevent recreation
  const toggleEditMode = useCallback(() => {
    setIsEditing(prev => !prev);
    setUpdateSuccess("");
  }, []);

  // Memoized handler for form field changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditableData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Memoized handler for avatar changes
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB");
        return;
      }

      // Validate file type
      if (!file.type.match("image.*")) {
        setError("Please select an image file");
        return;
      }

      setAvatarFile(file);
      setError(null);
    }
  }, []);

  // Memoized form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object for submission
      const formData = new FormData();
      formData.append("name", editableData.name);
      formData.append("phone", editableData.phone);
      formData.append("street", editableData.street);
      formData.append("city", editableData.city);
      formData.append("state", editableData.state);
      
      // Add avatar file if present
      if (avatarFile) {
        formData.append("avatarImage", avatarFile);
      }
      
      // Send update request
      const response = await axiosInstance.put("/api/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (response.data.success) {
        // Update local state with new data
        setUserData(prevData => ({
          ...prevData,
          name: editableData.name,
          phone: editableData.phone,
          address: {
            street: editableData.street,
            city: editableData.city,
            state: editableData.state
          },
          avatar: response.data.data.avatar || prevData.avatar
        }));
        
        setUpdateSuccess("Profile updated successfully");
        setAvatarFile(null);
        
        // Exit edit mode after short delay
        setTimeout(() => {
          setIsEditing(false);
          setUpdateSuccess("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }, [editableData, avatarFile]);

  // Memoize props that will be passed to child components
  const profileFormProps = useMemo(() => ({
    editableData,
    handleChange,
    handleSubmit,
    loading,
    toggleEditMode,
    statesList
  }), [editableData, handleChange, handleSubmit, loading, toggleEditMode]);

  const profileHeaderProps = useMemo(() => ({
    isEditing,
    userData: userData || {},
    handleAvatarChange,
    avatarFile,
    updateSuccess,
    error
  }), [isEditing, userData, handleAvatarChange, avatarFile, updateSuccess, error]);

  const profileInfoProps = useMemo(() => ({
    userData: userData || {},
    toggleEditMode,
    isOwnProfile: !id
  }), [userData, toggleEditMode, id]);

  if (loading && !userData) {
    return <ProfileSkeleton />;
  }

  if (error && !userData) {
    return <ErrorDisplay error={error} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <ProfileHeader {...profileHeaderProps} />
          
          <div className="p-4 sm:p-6 pt-0">
            {isEditing ? (
              <ProfileForm {...profileFormProps} />
            ) : (
              <ProfileInfo {...profileInfoProps} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;