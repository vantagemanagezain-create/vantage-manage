'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  User,
  Building2,
} from 'lucide-react';

type Vendor = {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
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

export default function VendorProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchVendor() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*, categories(name)')
        .eq('slug', slug)
        .eq('active', true)
        .single();
      if (error || !data) {
        setNotFound(true);
      } else {
        setVendor(data);
      }
      setLoading(false);
    }
    fetchVendor();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  if (notFound || !vendor)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Vendor not found.</p>
        <Link href="/vendors" className="text-blue-600 hover:underline">
          Back to Directory
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/vendors"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ArrowLeft size={16} /> Back to Directory
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center gap-5 p-6 border-b bg-gradient-to-r from-blue-50 to-white">
            {vendor.profile_image ? (
              <img
                src={vendor.profile_image}
                alt={vendor.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center border-4 border-white shadow shrink-0">
                <span className="text-3xl font-bold text-white">
                  {vendor.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vendor.name}
              </h1>
              {vendor.categories?.name && (
                <span className="inline-block mt-1 text-sm text-blue-600 bg-blue-50 px-3 py-0.5 rounded-full">
                  {vendor.categories.name}
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {vendor.owner_name && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Owner
                  </p>
                  <p className="text-sm font-medium">{vendor.owner_name}</p>
                </div>
              </div>
            )}

            {vendor.description && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    About
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {vendor.description}
                  </p>
                </div>
              </div>
            )}

            {(vendor.area || vendor.address || vendor.state) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Location
                  </p>
                  <p className="text-sm text-gray-700">
                    {[vendor.area, vendor.address, vendor.state]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            {vendor.mobile_number && (
              <a
                href={`tel:${vendor.mobile_number}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium"
              >
                <Phone size={16} /> {vendor.mobile_number}
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
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
