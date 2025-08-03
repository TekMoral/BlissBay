// src/pages/User/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token directly to handle page refreshes
    const token = localStorage.getItem('token');
    
    // Redirect if not authenticated and no token exists
    if (!isAuthenticated && !token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
    console.log('Fetching profile...');

const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    
    // Debug: Log the request headers
    console.log('Making request to /api/users/me');

        const { data } = await axiosInstance.get('/api/users/me');
            console.log('Response received:', data);

        if (data.success) {
          setProfile(data.data);
        } else {
          setError('Failed to load profile data');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        console.error('Response status:', err.response?.status);
        setError(err.response?.data?.message || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/login', { replace: true })}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const defaultAddress = profile.defaultAddress || (profile.addresses && profile.addresses[0]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-blue-600 px-6 py-8 text-white">
            <div className="flex items-center">
              <div className="relative">
                {profile.avatar ? (
                  <img 
                    src={`${import.meta.env.VITE_API_BASE_URL}${profile.avatar}`} 
                    alt={profile.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-400 flex items-center justify-center border-4 border-white">
                    <span className="text-3xl font-bold text-white">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-blue-200">{profile.email}</p>
                <p className="text-blue-200 mt-1">
                  Member since {new Date(profile.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{profile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium capitalize">{profile.role}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/profile/edit')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Default Address</h2>
                {defaultAddress ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Street</p>
                      <p className="font-medium">{defaultAddress.street}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">{defaultAddress.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="font-medium">{defaultAddress.state}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">{defaultAddress.country}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No address information available</p>
                )}
                <div className="mt-4">
                  <button 
                    onClick={() => navigate('/profile/address')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Manage Addresses
                  </button>
                </div>
              </div>

              {/* Account Statistics */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${profile.totalSpent?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Orders</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.orderCount || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">Reviews</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {profile.reviewCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/profile/change-password')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                >
                  Change Password
                </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                >
                  Order History
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm"
                >
                  Wishlist
                </button>
                <button 
                  onClick={() => navigate('/profile/delete')}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded text-sm"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;