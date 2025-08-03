// src/admin/pages/UserDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../lib/axiosInstance";
import { toast } from "react-toastify";

export default function UserDetails() {
  const { id } = useParams();          // user ID from /admin/users/:id
  const navigate = useNavigate();

  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  /* ───────────────────────── Fetch user once ───────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get(`/api/admin/users/${id}`);
        setUser(data);
      } catch (e) {
        toast.error("Failed to load user");
        navigate("/admin/users");            // bounce back if invalid ID
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  /* ───────────────────────── Handlers ───────────────────────── */
  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    if (newRole === user.role) return;
    await saveChanges({ role: newRole });
  };

  const toggleSuspension = async () => {
    await saveChanges({ isSuspended: !user.isSuspended });
  };

  /** Shared PATCH helper */
  const saveChanges = async (updates) => {
    setSaving(true);
    try {
      const { data } = await axiosInstance.patch(`/api/admin/users/${id}`, updates);
      setUser(data);                          // optimistic UI update
      toast.success("User updated");
    } catch (e) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ───────────────────────── Render ───────────────────────── */
  if (loading) return <p className="text-center py-10">Loading…</p>;
  if (!user)    return null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">User Details</h2>

      <div className="space-y-2 mb-6">
        <p><strong>Name:</strong>  {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Joined:</strong>{new Date(user.createdAt).toLocaleDateString()}</p>
      </div>

      {/* ── Role & Suspension Controls ─────────────────────────── */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Role</label>
          <select
            value={user.role}
            onChange={handleRoleChange}
            disabled={saving}
            className="border px-3 py-2 rounded"
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold">Account Status:</span>
          <button
            onClick={toggleSuspension}
            disabled={saving}
            className={`px-4 py-1 rounded text-white transition
                        ${user.isSuspended ? "bg-green-600 hover:bg-green-700"
                                            : "bg-red-600 hover:bg-red-700"}`}
          >
            {user.isSuspended ? "Unsuspend" : "Suspend"}
          </button>
          <span className="italic text-sm">
            {user.isSuspended ? "Suspended" : "Active"}
          </span>
        </div>
      </div>
    </div>
  );
}
