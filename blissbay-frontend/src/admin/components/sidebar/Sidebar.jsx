// src/admin/components/Sidebar.jsx
import SidebarNavItem from "./SidebarNavItem";
import SidebarUserInfo from "./SidebarUserInfo";
import SidebarToggleButton from "./SidebarToggleButton";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { navItems } from './navItems'; 
import { LogOut } from 'lucide-react';

export function SidebarLogoutButton({ collapsed }) {
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


export default function Sidebar({
  collapsed,
  setCollapsed,
  isMobile,
  showSidebar,
  setShowSidebar
}) {
  const userInfo = {
    name: localStorage.getItem('userName') || 'Admin User',
    role: localStorage.getItem('userRole') || 'Administrator',
  };
  
  const effectiveCollapsed = isMobile ? false : collapsed;

  const handleCollapseToggle = () => {
    if (!isMobile) setCollapsed(!collapsed);
  };

  return (
    <>
      {isMobile && (
        <SidebarToggleButton
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
        />
      )}

      <aside
        className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          ${isMobile ? 'w-64' : effectiveCollapsed ? 'w-20' : 'w-42'}
          bg-white shadow-md flex flex-col fixed h-full z-50 transition-all duration-300
          ${isMobile ? '' : 'md:translate-x-0'}
        `}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {!effectiveCollapsed && (
            <div className="text-xl font-bold text-blue-600">Admin Panel</div>
          )}
          {!isMobile && (
            <button
              onClick={handleCollapseToggle}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
        </div>

        <SidebarUserInfo collapsed={effectiveCollapsed} userInfo={userInfo} />

        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.name}
              item={item}
              collapsed={effectiveCollapsed}
            />
          ))}
        </nav>

        <SidebarLogoutButton collapsed={effectiveCollapsed} />
      </aside>

      {isMobile && showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
      
      {/* Remove the spacer div that was causing extra margin */}
    </>
  );
}