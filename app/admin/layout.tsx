'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) {
        setIsAdmin(!!session);
      }
    };

    syncSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsAdmin(!!session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    setIsAdmin(false);
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const showSidebar = isAdmin && !isLoginPage;

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (<aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">Vantage Manage</h1>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/vendors"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Vendors
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/admin/advertisements"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Advertisements
          </Link>
        </nav>
        {isAdmin && (
          <div className="p-3 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </aside>)}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
