'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  MessageSquare,
  LogOut 
} from 'lucide-react';
import { logout } from '../../lib/authClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClientSidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/client',
      icon: LayoutDashboard,
    },
    {
      name: 'My Projects',
      href: '/client/projects',
      icon: FolderKanban,
    },
    {
      name: 'Feedback',
      href: '/client/feedback',
      icon: MessageSquare,
    },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">ProjectPulse</h1>
        <p className="text-sm text-gray-400 mt-1">Client Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-4">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-600 rounded">
            CLIENT
          </span>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center space-x-2 w-full px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <LogOut size={20} />
          <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  );
}