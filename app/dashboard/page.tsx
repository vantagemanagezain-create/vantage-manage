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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!vendor) return null;

  const isVisible = vendor.subscription_status === 'active' &&
    vendor.subscription_end !== null &&
    new Date(vendor.subscription_end) > new Date();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getSubscriptionBadge = () => {
    switch (vendor.subscription_status) {
      case 'active': return <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle size={16} /> Active</span>;
      case 'suspended': return <span className="flex items-center gap-1 text-orange-500 font-semibold"><AlertCircle size={16} /> Suspended</span>;
      case 'expired': return <span className="flex items-center gap-1 text-red-500 font-semibold"><XCircle size={16} /> Expired</span>;
      case 'pending': return <span className="flex items-center gap-1 text-yellow-500 font-semibold"><Clock size={16} /> Pending</span>;
      default: return <span className="flex items-center gap-1 text-gray-500 font-semibold"><XCircle size={16} /> Inactive</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <Store size={20} className="text-blue-600" /> Vantage Manage
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Welcome back!</h1>
              <p className="text-blue-100 mt-1">{vendor.vendor_name}</p>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-blue-200">Owner</p><p className="font-medium">{vendor.owner_name}</p></div>
                <div><p className="text-blue-200">Email</p><p className="font-medium">{vendor.email}</p></div>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <CreditCard size={18} /> <span className="text-sm font-medium">Subscription</span>
            </div>
            {getSubscriptionBadge()}
            <p className="text-xs text-gray-400 mt-1">Plan: {vendor.subscription_plan || 'basic'}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <CheckCircle size={18} /> <span className="text-sm font-medium">Payment</span>
            </div>
            <span className={`font-semibold ${vendor.payment_status === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
              {vendor.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Eye size={18} /> <span className="text-sm font-medium">Visibility</span>
            </div>
            {isVisible ? (
              <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle size={16} /> Live</span>
            ) : (
              <span className="flex items-center gap-1 text-gray-400 font-semibold"><XCircle size={16} /> Not Visible</span>
            )}
          </div>
        </div>

        {/* Subscription Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-700 mb-4">
            <Calendar size={18} /> <h2 className="font-semibold">Subscription Details</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-400">Start Date</p><p className="font-medium text-gray-700">{formatDate(vendor.subscription_start)}</p></div>
            <div><p className="text-xs text-gray-400">Expiry Date</p><p className="font-medium text-gray-700">{formatDate(vendor.subscription_end)}</p></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/dashboard/edit-profile" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Edit size={16} /> Edit Profile
          </Link>
          {vendor.slug && (
            <Link href={`/vendors/${vendor.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <Eye size={16} /> View Public Profile
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
