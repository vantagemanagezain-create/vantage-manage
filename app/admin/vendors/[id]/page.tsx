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
  name: string;
  slug: string;
  owner_name: string;
  category_id: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;
  address: string;
  state: string;
  description: string;
  active: boolean;
  profile_image: string;
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

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error || !vendor)
    return (
      <div className="p-8 text-center text-red-500">{error || 'Not found'}</div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/vendors"
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Vendor Details</h1>
        </div>
        <Link
          href={`/admin/vendors/${id}/edit`}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Pencil size={16} /> Edit
        </Link>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 p-6 border-b">
          {vendor.profile_image ? (
            <img
              src={vendor.profile_image}
              alt={vendor.name}
              className="w-20 h-20 object-cover rounded-full border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {vendor.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{vendor.name}</h2>
            <p className="text-gray-500 text-sm">@{vendor.slug}</p>
            <span
              className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full ${
                vendor.active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {vendor.active ? (
                <CheckCircle size={12} />
              ) : (
                <XCircle size={12} />
              )}
              {vendor.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {vendor.owner_name && (
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Owner</p>
                <p className="text-sm font-medium">{vendor.owner_name}</p>
              </div>
            </div>
          )}

          {vendor.categories?.name && (
            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Category</p>
                <p className="text-sm font-medium">{vendor.categories.name}</p>
              </div>
            </div>
          )}

          {vendor.description && (
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Description</p>
                <p className="text-sm">{vendor.description}</p>
              </div>
            </div>
          )}

          {(vendor.area || vendor.address || vendor.state) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="text-sm">
                  {[vendor.area, vendor.address, vendor.state]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {vendor.mobile_number && (
              <a
                href={`tel:${vendor.mobile_number}`}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm"
              >
                <Phone size={14} /> {vendor.mobile_number}
              </a>
            )}
            {vendor.whatsapp_number && (
              <a
                href={`https://wa.me/91${vendor.whatsapp_number.replace(
                  /\D/g,
                  ''
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
