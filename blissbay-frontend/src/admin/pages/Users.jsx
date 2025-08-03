// src/admin/pages/Users.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/api/admin/users");
        setUsers(data.users || data); // Handle different API response formats
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="text-center py-10">Loading users...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">All Users</h1>
      
      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No users found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.role}</td>
                  <td className="p-2">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      user.isSuspended 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {user.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="p-2">
                    <Link
                      to={`/admin/users/${user._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;