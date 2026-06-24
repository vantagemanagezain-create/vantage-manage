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
  payment_status: string;
  categories?: { name: string };
};

export default function VendorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVendor() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*, categories(name)')
        .eq('id', id)
        .single();
      if (error || !data) {
        setError('Vendor not found');
      } else {
        setVendor(data);
      }
      setLoading(false);
    }
    fetchVendor();
  }, [id]);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !vendor)
    return <div className="p-8 text-red-400">{error || 'Not found'}</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/vendors" className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Vendors
          </Link>
          <Link
            href={`/admin/vendors/${vendor.id}/edit`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Link>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-4 flex items-center gap-5">
          {vendor.profile_image ? (
            <img src={vendor.profile_image} alt={vendor.vendor_name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
              {vendor.vendor_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{vendor.vendor_name}</h1>
            <p className="text-gray-400 text-sm">@{vendor.slug}</p>
            <span className={`inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium ${
              vendor.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}>
              {vendor.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {vendor.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 space-y-4">
          {vendor.owner_name && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Owner</p>
                <p>{vendor.owner_name}</p>
              </div>
            </div>
          )}
          {vendor.email && (
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p>{vendor.email}</p>
              </div>
            </div>
          )}
          {vendor.categories?.name && (
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p>{vendor.categories.name}</p>
              </div>
            </div>
          )}
          {vendor.description && (
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p>{vendor.description}</p>
              </div>
            </div>
          )}
          {(vendor.area || vendor.address || vendor.state) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p>{[vendor.area, vendor.address, vendor.state].filter(Boolean).join(', ')}</p>
              </div>
            </div>
          )}
          <div className="flex gap-4 pt-2">
            {vendor.mobile_number && (
              <a href={`tel:${vendor.mobile_number}`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">
                <Phone className="w-4 h-4" />
                {vendor.mobile_number}
              </a>
            )}
            {vendor.whatsapp_number && (
              <a
                href={`https://wa.me/91${vendor.whatsapp_number.replace(/\D/g, '')}`}
                className="flex items-center gap-2 bg-green-900 hover:bg-green-800 px-4 py-2 rounded-lg text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}
          </div>
          <div className="border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 mb-3">Subscription</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500">Status</p>
                <p className="capitalize">{vendor.subscription_status || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500">Plan</p>
                <p className="capitalize">{vendor.subscription_plan || 'N/A'}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500">Payment</p>
                <p className="capitalize">{vendor.payment_status || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
