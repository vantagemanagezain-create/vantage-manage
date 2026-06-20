'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Store, Tag, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    vendors: 0,
    categories: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [
        { count: vendorsCount },
        { count: categoriesCount },
        { count: usersCount },
      ] = await Promise.all([
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
      ]);
      setStats({
        vendors: vendorsCount || 0,
        categories: categoriesCount || 0,
        users: usersCount || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    {
      label: 'Total Vendors',
      value: stats.vendors,
      icon: Store,
      color: 'text-blue-400',
    },
    {
      label: 'Categories',
      value: stats.categories,
      icon: Tag,
      color: 'text-green-400',
    },
    {
      label: 'Users',
      value: stats.users,
      icon: Users,
      color: 'text-purple-400',
    },
    {
      label: 'Active',
      value: stats.vendors,
      icon: TrendingUp,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">
          Welcome to Vantage Manage Admin Portal
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-3xl font-bold text-white">
              {loading ? '...' : card.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
