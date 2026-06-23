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
  active: boolean;
};

export default function DashboardPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuthAndFetchVendor();
  }, []);

  const checkAuthAndFetchVendor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch vendor data
    const { data, error } = await supabase
      .from('vendors')
      .select('id, vendor_name, owner_name, email, mobile_number, area, subscription_status, subscription_plan, subscription_start, subscription_end, payment_status, active')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setVendor(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle size={16} /> Active
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
            <XCircle size={16} /> Expired
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
            <Clock size={16} /> Pending
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            Inactive
          </span>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isVisible = vendor && vendor.active && vendor.subscription_status === 'active' && vendor.subscription_end && new Date(vendor.subscription_end) > new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Vendor Profile Found</h2>
          <p className="text-gray-600 mb-6">Your account doesn't have a vendor profile yet.</p>
          <Link href="/register-business" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Complete Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Store className="text-blue-600" size={24} />
            <span>Vantage Manage</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
              <p className="text-blue-100 text-lg">{vendor.vendor_name}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <User size={32} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-200">Owner</p>
              <p className="font-medium">{vendor.owner_name}</p>
            </div>
            <div>
              <p className="text-blue-200">Email</p>
              <p className="font-medium text-sm">{vendor.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Subscription Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Subscription</h3>
            </div>
            {getStatusBadge(vendor.subscription_status)}
            <p className="text-xs text-gray-500 mt-3">Plan: {vendor.subscription_plan}</p>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Payment</h3>
            </div>
            <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
              vendor.payment_status === 'paid' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {vendor.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>

          {/* Profile Visibility */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="text-purple-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900">Visibility</h3>
            </div>
            {isVisible ? (
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <CheckCircle size={16} /> Live on Directory
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <XCircle size={16} /> Not Visible
              </span>
            )}
          </div>
        </div>

        {/* Subscription Details Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-gray-600" />
            Subscription Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Start Date</p>
              <p className="font-medium text-gray-900">{formatDate(vendor.subscription_start)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
              <p className="font-medium text-gray-900">{formatDate(vendor.subscription_end)}</p>
            </div>
          </div>

          {vendor.subscription_status === 'pending' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Awaiting Activation:</strong> Your subscription is pending admin approval. You'll be notified once activated.
              </p>
            </div>
          )}

          {vendor.subscription_status === 'expired' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Subscription Expired:</strong> Renew your subscription to appear on the directory.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/vendors/${vendor.vendor_name.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-600 text-gray-900 font-medium px-6 py-3 rounded-xl transition-all"
          >
            <Eye size={20} /> View Public Profile
          </Link>
          <button
            disabled
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-medium px-6 py-3 rounded-xl cursor-not-allowed"
          >
            <Edit size={20} /> Edit Profile (Coming Soon)
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">Business Contact</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Mobile:</strong> {vendor.mobile_number}</p>
            <p><strong>Area:</strong> {vendor.area}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
