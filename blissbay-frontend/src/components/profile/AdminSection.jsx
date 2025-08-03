// AdminSection Component
// File: ./profile/AdminSection.jsx
import { memo } from "react";
import { FiShield, FiShoppingBag, FiDollarSign, FiClock } from "react-icons/fi";

const AdminSection = memo(({ adminData }) => {
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FiShield className="mr-2 text-blue-500" />
        Admin Information
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <FiShoppingBag className="text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Order Count</p>
            <p className="font-semibold">{adminData.orderCount}</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <FiDollarSign className="text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="font-semibold">₦{adminData.totalSpent.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <FiClock className="text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Last Login</p>
            <p className="font-semibold">{formatDate(adminData.lastLogin)}</p>
          </div>
        </div>
        
        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
          <div className={`h-3 w-3 rounded-full mr-3 ${
            adminData.accountStatus === "active" 
              ? "bg-green-500" 
              : "bg-red-500"
          }`}></div>
          <div>
            <p className="text-sm text-gray-500">Account Status</p>
            <p className="font-semibold capitalize">{adminData.accountStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
});

AdminSection.displayName = 'AdminSection';

export default AdminSection;