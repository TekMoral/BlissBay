import { LogOut } from 'lucide-react';

export default function SidebarLogoutButton({ collapsed }) {
  return (
    <div className="px-4 py-4 border-t">
      <button
        className={`flex items-center ${
          collapsed ? 'justify-center w-full' : 'justify-start gap-2'
        } text-sm text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors`}
      >
        <LogOut size={18} />
        {!collapsed && 'Logout'}
      </button>
    </div>
  );
}
