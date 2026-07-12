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
      case 'active': return <CheckCircle className="w-5 h-5" />;
      case 'suspended': return <XCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'suspended': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vendor profile not found.</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{vendor.vendor_name}</h1>
            <p className="text-sm text-gray-500">Vendor Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/vendors/${vendor.slug}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Banner */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${getStatusColor(vendor.subscription_status)}`}>
          {getStatusIcon(vendor.subscription_status)}
          <span>Subscription: {vendor.subscription_status}</span>
          <span className="ml-auto">Plan: {vendor.subscription_plan || 'Not set'}</span>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Business Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Business Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Business Name</p>
                <p className="text-sm font-medium text-gray-900">{vendor.vendor_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Owner</p>
                <p className="text-sm font-medium text-gray-900">{vendor.owner_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Area</p>
                <p className="text-sm font-medium text-gray-900">{vendor.area}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Contact Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-gray-900 break-all">{vendor.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                <p className="text-sm font-medium text-gray-900">{vendor.mobile_number}</p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Subscription</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Plan</p>
                <p className="text-sm font-medium text-gray-900">{vendor.subscription_plan || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Payment Status</p>
                <p className="text-sm font-medium text-gray-900">{vendor.payment_status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Start</p>
                <p className="text-sm font-medium text-gray-900">{vendor.subscription_start ? new Date(vendor.subscription_start).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">End</p>
                <p className="text-sm font-medium text-gray-900">{vendor.subscription_end ? new Date(vendor.subscription_end).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/vendors/${vendor.slug}`}
              className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Public Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
