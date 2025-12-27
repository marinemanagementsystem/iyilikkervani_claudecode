import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Home,
  HeartHandshake,
  LogOut,
  Heart,
  Map,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/users', icon: Users, label: 'Kullanicilar' },
  { path: '/regions', icon: MapPin, label: 'Bolgeler' },
  { path: '/households', icon: Home, label: 'Haneler' },
  { path: '/aid-transactions', icon: HeartHandshake, label: 'Yardimlar' },
  { path: '/map', icon: Map, label: 'Harita' },
  { path: '/profile', icon: UserCircle, label: 'Profil' },
];

export const Sidebar: React.FC = () => {
  const { userData, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">İyilik Kervanı</h1>
            <p className="text-slate-400 text-xs">Yönetim Paneli</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="mb-3 px-4">
          <p className="text-white font-medium truncate">{userData?.name}</p>
          <p className="text-slate-400 text-sm capitalize">{userData?.role}</p>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
};
