import { User } from 'lucide-react';

export default function SidebarUserInfo({ collapsed, userInfo }) {
  return (
    <div className={`p-4 border-b flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <User size={30} />
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <p className="font-medium truncate">{userInfo.name}</p>
          <p className="text-xs text-gray-500 truncate">{userInfo.role}</p>
        </div>
      )}
    </div>
  );
}
