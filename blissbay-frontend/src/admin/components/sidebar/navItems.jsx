import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  Users,
  Settings,
  BarChart3,
  Tags,
} from 'lucide-react';

export const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Products', path: '/admin/products', icon: <Boxes size={20} /> },
  { name: 'Categories', path: '/admin/categories', icon: <Tags size={20} /> },
  { name: 'Orders', path: '/admin/orders', icon: <ClipboardList size={20} /> },
  { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  { name: 'Reports', path: '/admin/reports', icon: <BarChart3 size={20} /> },
  { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
];
