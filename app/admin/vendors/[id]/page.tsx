'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Pencil,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  User,
  CheckCircle,
  XCircle,
  Building2,
  CreditCard,
} from 'lucide-react';

type Vendor = {
  id: string;
  vendor_name: string;
  slug: string;
  owner_name: string;
  email: string;
  category_id: string;
  subcategory_id: string;
  city_id: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;
  address: string;
  state: string;
  description: string;
  active: boolean;
  profile_image: string;
  subscription_status: string;
  subscription_plan: string;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_status: string;
  payment_method: string;
  payment_amount: number | null;
  payment_reference: string;
  admin_notes: string;
  categories?: { name: string };
};

export default function VendorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const [payMethod, setPayMethod] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    async function fetchVendor() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*, categories(name)')
        .eq('id', id)
        .single();
      if (error || !data) {
        setFetchError('Vendor not found');
        console.error('Fetch error:', error);
      } else {
        setVendor(data as Vendor);
        setPayMethod(data.payment_method || '');
        setPayAmount(data.payment_amount ? String(data.payment_amount) : '');
        setPayRef(data.payment_reference || '');
        setAdminNotes(data.admin_notes || '');
      }
      setLoading(false);
    }
    fetchVendor();
  }, [id]);

  const markPaidAndActivate = async () => {
    setSaving(true);
    setSaveMsg('');
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const { error } = await supabase
      .from('vendors')
      .update({
        payment_status: 'paid',
        payment_method: payMethod || 'cash',
        payment_amount: payAmount ? parseFloat(payAmount) : null,
        payment_reference: payRef,
        admin_notes: adminNotes,
        active: true,
        subscription_status: 'active',
        subscription_start: now.toISOString(),
        subscription_end: oneYearLater.toISOString(),
      })
      .eq('id', id);
    if (error) {
      setSaveMsg('Error: ' + error.message);
      console.error('Update error:', error);
    } else {
      setSaveMsg('Vendor activated successfully!');
      const { data } = await supabase.from('vendors').select('*, categories(name)').eq('id', id).single();
      if (data) setVendor(data as Vendor);
    }
    setSaving(false);
  };

  const savePaymentDetails = async () => {
    setSaving(true);
    setSaveMsg('');
    const { error } = await supabase
      .from('vendors')
      .update({
        payment_method: payMethod,
        payment_amount: payAmount ? parseFloat(payAmount) : null,
        payment_reference: payRef,
        admin_notes: adminNotes,
      })
      .eq('id', id);
    setSaveMsg(error ? 'Error: ' + error.message : 'Saved!');
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>;
  if (fetchError || !vendor) return <div className="p-8 text-red-400">{fetchError || 'Not found'}</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link href="/admin/vendors" className="flex items-center text-gray-400 hover:text-white gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Vendors
        </Link>
        <Link href={`/admin/vendors/${id}/edit`} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg gap-2 text-sm">
          <Pencil className="w-4 h-4" /> Edit Vendor
        </Link>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
        <div className="flex items-start gap-4">
          {vendor.profile_image ? (
            <img src={vendor.profile_image} alt={vendor.vendor_name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {vendor.vendor_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{vendor.vendor_name}</h1>
            <p className="text-gray-400 text-sm">@{vendor.slug}</p>
            <span className={`inline-flex items-center gap-1 mt-1 text-sm ${vendor.active ? 'text-green-400' : 'text-red-400'}`}>
              {vendor.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {vendor.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {vendor.owner_name && (
            <div className="flex items-center gap-2 text-gray-300">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Owner:</span> {vendor.owner_name}
            </div>
          )}
          {vendor.categories?.name && (
            <div className="flex items-center gap-2 text-gray-300">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-gray-500">Category:</span> {vendor.categories.name}
            </div>
          )}
          {vendor.mobile_number && (
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${vendor.mobile_number}`} className="hover:text-blue-400">{vendor.mobile_number}</a>
            </div>
          )}
          {vendor.whatsapp_number && (
            <div className="flex items-center gap-2 text-gray-300">
              <MessageCircle className="w-4 h-4 text-gray-500" />
              <a href={`https://wa.me/91${vendor.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-green-400">WhatsApp</a>
            </div>
          )}
          {(vendor.area || vendor.address || vendor.state) && (
            <div className="flex items-center gap-2 text-gray-300 md:col-span-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{[vendor.area, vendor.address, vendor.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {vendor.description && (
          <p className="text-gray-400 text-sm border-t border-gray-700 pt-4">{vendor.description}</p>
        )}

        <div className="border-t border-gray-700 pt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs">Subscription</p>
            <p className="text-white font-medium capitalize">{vendor.subscription_status || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Plan</p>
            <p className="text-white font-medium">{vendor.subscription_plan || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Payment</p>
            <p className="text-white font-medium capitalize">{vendor.payment_status || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-blue-400" /> Manage Subscription & Payment
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Select method</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="razorpay">Razorpay</option>
              <option value="cheque">Cheque</option>
              <option value="free">Free</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Payment Amount (Rs.)</label>
            <input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="e.g. 1999"
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Payment Reference / Transaction ID</label>
            <input
              type="text"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="e.g. UPI-123456"
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Admin Notes</label>
            <input
              type="text"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes..."
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={markPaidAndActivate}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            {saving ? 'Processing...' : 'Mark Paid & Activate (1 Year)'}
          </button>
          <button
            onClick={savePaymentDetails}
            disabled={saving}
            className="px-6 bg-gray-700 hover:bg-gray-600 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Save Details
          </button>
        </div>
        {saveMsg && (
          <p className={`mt-3 text-sm font-medium ${saveMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {saveMsg}
          </p>
        )}
      </div>
    </div>
  );
}
