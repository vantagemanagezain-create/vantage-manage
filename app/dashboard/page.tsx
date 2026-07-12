'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, User, Calendar, CreditCard, Eye, LogOut, Edit, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

type Vendor = {
  id: string;
  vendor_name: string;
  owner_name: string;
  email: string;
  mobile_number: string;
  area: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_status: string;
  slug: string;
};

export default function DashboardPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const checkAuthAndFetchVendor = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      router.push('/login');
      return;
    }

    const user = session.user;

    const { data, error } = await supabase
      .from('vendors')
      .select('id, vendor_name, owner_name, email, mobile_number, area, subscription_status, subscription_plan, subscription_start, subscription_end, payment_status, slug')
      .eq('email', user.email)
      .single();

    if (error || !data) {
      router.push('/login');
      return;
    }

    setVendor(data as Vendor);
    setLoading(false);
  };

  useEffect(() => {
    checkAuthAndFetchVendor();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'suspended': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'suspended': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">Vendor profile not found.</p>
          <button onClick={handleLogout} className="mt-4 text-blue-400 underline">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-white">{vendor.vendor_name}</h1>
              <p className="text-xs text-gray-400">Vendor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href={`/vendors/${vendor.slug}`}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-400 hover:text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-8 ${getStatusColor(vendor.subscription_status)}`}>
          {getStatusIcon(vendor.subscription_status)}
          <div>
            <p className="font-medium capitalize">Subscription: {vendor.subscription_status}</p>
            <p className="text-sm opacity-75">Plan: {vendor.subscription_plan || 'Not set'}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Business Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Business Name</p>
                <p className="text-white">{vendor.vendor_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Owner</p>
                <p className="text-white">{vendor.owner_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Area</p>
                <p className="text-white">{vendor.area}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-white">Contact Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-white">{vendor.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mobile</p>
                <p className="text-white">{vendor.mobile_number}</p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-white">Subscription</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Plan</p>
                <p className="text-white capitalize">{vendor.subscription_plan || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="text-white capitalize">{vendor.payment_status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Start</p>
                <p className="text-white">{vendor.subscription_start ? new Date(vendor.subscription_start).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">End</p>
                <p className="text-white">{vendor.subscription_end ? new Date(vendor.subscription_end).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-orange-400" />
              <h2 className="font-semibold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link
                href={`/vendors/${vendor.slug}`}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Public Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
