'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', emoji: '🏠' },
  { href: '/admin/categories', label: 'Categories', emoji: '🏷️' },
  { href: '/admin/vendors', label: 'Vendors', emoji: '🏪' },
  { href: '/admin/users', label: 'Users', emoji: '👥' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white">Vantage</span>
        <span className="text-blue-400 font-bold text-lg"> Manage</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">Moradabad Directory</p>
      </div>
    </aside>
  );
}
