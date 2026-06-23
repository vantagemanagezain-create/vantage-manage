'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, MessageCircle, MapPin, Tag, User, Building2, Store } from 'lucide-react';

type Vendor = {
  id: string;
  vendor_name: string;
  slug: string;
  owner_name: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;
  description: string;
  profile_image: string;
  active: boolean;
  categories?: { name: string };
};

export default function VendorDetailPage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (slug) fetchVendor();
  }, [slug]);

  useEffect(() => {
    if (vendor) {
      document.title = `${vendor.vendor_name} | Moradabad Business Directory`;
    }
  }, [vendor]);

  async function fetchVendor() {
    setLoading(true);
    const { data } = await supabase
      .from('vendors')
      .select('*, categories(name)')
      .eq('slug', slug)
      .eq('active', true)
      .single();
    setVendor(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <Store size={40} className="mx-auto mb-3 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-40" />
          <p>Vendor not found.</p>
          <Link href="/vendors" className="text-blue-600 text-sm hover:underline mt-2 inline-block">Back to Directory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/vendors" className="text-gray-500 hover:text-gray-800"><ArrowLeft size={20} /></Link>
          <div className="flex items-center gap-2">
            <Store className="text-blue-600" size={22} />
            <span className="font-bold text-lg text-gray-900">Vantage Manage</span>
          </div>
        </div>
        <Link href="/admin" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Admin</Link>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-800" />
            <div className="px-6 pb-6">
              <div className="-mt-10 mb-4">
                <div className="w-20 h-20 bg-white border-4 border-white rounded-2xl shadow-md flex items-center justify-center">
                  {vendor.profile_image ? (
                    <img src={vendor.profile_image} alt={vendor.vendor_name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Store size={32} className="text-blue-600" />
                  )}
                </div>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{vendor.vendor_name}</h1>
                  {vendor.categories?.name && (
                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1">
                      <Tag size={10} /> {vendor.categories.name}
                    </span>
                  )}
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
              </div>
              {vendor.description && (
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{vendor.description}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-900 mb-4">Business Details</h2>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Owner</p>
                <p className="text-sm font-medium text-gray-900">{vendor.owner_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Area</p>
                <p className="text-sm font-medium text-gray-900">{vendor.area}, Moradabad</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a href={`tel:${vendor.mobile_number}`} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 font-medium">
              <Phone size={18} /> Call Now
            </a>
            {vendor.whatsapp_number && (
              <a href={`https://wa.me/91${vendor.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-medium">
                <MessageCircle size={18} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-4 text-xs">
        Moradabad Business Directory &copy; {new Date().getFullYear()} &middot; Powered by Vantage Manage
      </footer>
    </div>
  );
}
