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
  subscription_status: string;
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
      .eq('subscription_status', 'active')
      .single();
    setVendor(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Store size={48} className="text-gray-300" />
        <p className="text-gray-500">Vendor not found.</p>
        <Link href="/vendors" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
            <Store size={20} className="text-blue-600" /> Vantage Manage
          </Link>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Admin</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/vendors" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-start gap-6">
              {vendor.profile_image ? (
                <img src={vendor.profile_image} alt={vendor.vendor_name} className="w-20 h-20 rounded-full object-cover border-4 border-white/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Building2 size={32} className="text-white" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{vendor.vendor_name}</h1>
                {vendor.categories?.name && (
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <Tag size={12} /> {vendor.categories.name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 mt-2 ml-2 px-3 py-1 bg-green-500/30 rounded-full text-sm">Active</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {vendor.description && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About</h2>
                <p className="text-gray-700">{vendor.description}</p>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Business Details</h2>
              <div className="space-y-3">
                {vendor.owner_name && (
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <div><p className="text-xs text-gray-400">Owner</p><p className="text-gray-700 font-medium">{vendor.owner_name}</p></div>
                  </div>
                )}
                {vendor.area && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <div><p className="text-xs text-gray-400">Area</p><p className="text-gray-700 font-medium">{vendor.area}, Moradabad</p></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {vendor.mobile_number && (
                <a href={`tel:${vendor.mobile_number}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  <Phone size={18} /> Call Now
                </a>
              )}
              {vendor.whatsapp_number && (
                <a href={`https://wa.me/91${vendor.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Moradabad Business Directory &copy; {new Date().getFullYear()} &middot; Powered by Vantage Manage
      </footer>
    </div>
  );
}
