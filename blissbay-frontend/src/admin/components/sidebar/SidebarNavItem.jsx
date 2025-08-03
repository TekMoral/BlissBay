import { NavLink } from 'react-router-dom';

export default function SidebarNavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.name : ''}
      className={({ isActive }) =>
        `flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-2 px-2 py-2 my-1 rounded-md text-sm font-medium transition ${
          isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {item.icon}
      {!collapsed && item.name}
    </NavLink>
  );
}
