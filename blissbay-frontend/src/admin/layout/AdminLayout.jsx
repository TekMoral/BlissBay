// src/admin/layout/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import { useSidebar } from '../hooks/useSidebar';

export default function AdminLayout() {
  const {
    collapsed,
    setCollapsed,
    isMobile,
    showSidebar,
    setShowSidebar,
  } = useSidebar();

  const toggleMobileMenu = () => {
    setShowSidebar(!showSidebar);
  };

  // Calculate the left margin based on sidebar state
  const getMainContentStyle = () => {
    if (isMobile) return {};
    return {
      marginLeft: collapsed ? '5rem' : '10.5rem', // w-20 (5rem) when collapsed, w-42 (10.5rem) when expanded
    };
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobile={isMobile}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative" style={getMainContentStyle()}>
        {isMobile && (
          <header className="bg-white shadow-sm py-4 px-2 flex items-center md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-800">
              Admin Dashboard
            </h1>
          </header>
        )}

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}