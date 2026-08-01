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
  owner_name: string | null;
  category_id: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;
  description: string | null;
  profile_image: string | null;
  subscription_status: string | null;
  city_id: string | null;
  established_year: string | number | null;
  gst_number: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
};

export default function VendorDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (slug) {
      fetchVendor();
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    const handleFocus = () => {
      fetchVendor();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [slug]);

  useEffect(() => {
    if (vendor) {
      document.title = `${vendor.vendor_name} | Moradabad Business Directory`;
    }
  }, [vendor]);

  const buildExternalHref = (value: string | null | undefined) => {
    if (!value) return null;
    const trimmed = String(value).trim();
    if (!trimmed) return null;
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
  };

  async function fetchVendor() {
    if (!slug) return;

    setLoading(true);
    setCategoryName('');

    // Try using the browser Supabase client first.
    const { data, error } = await supabase
      .from('vendors')
      .select('id, vendor_name, slug, owner_name, category_id, mobile_number, whatsapp_number, area, address, city, state, pin_code, description, profile_image, subscription_status, city_id, established_year, gst_number, website, facebook, instagram, linkedin, youtube')
      .eq('slug', slug)
      .maybeSingle();

    let vendorData = data as Vendor | null;

    // If the client call failed (for example due to an invalid refresh token),
    // fall back to the public REST endpoint using the anon key so the page can
    // still render vendor data without depending on the auth refresh flow.
    if (!vendorData || error) {
      try {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/vendors?select=id,vendor_name,slug,owner_name,category_id,mobile_number,whatsapp_number,area,address,city,state,pin_code,description,profile_image,subscription_status,city_id,established_year,gst_number,website,facebook,instagram,linkedin,youtube&slug=eq.${encodeURIComponent(
          slug
        )}`;
        const res = await fetch(url, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
            Accept: 'application/json',
          },
        });
        if (res.ok) {
          const arr = await res.json();
          vendorData = (arr && arr.length > 0 ? arr[0] : null) as Vendor | null;
        } else {
          console.error('Vendor REST fallback failed', res.status, await res.text());
        }
      } catch (e) {
        console.error('Vendor REST fallback error', e);
        // swallow and continue; vendorData will remain null
      }
    }

    setVendor(vendorData);

    if (vendorData?.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', vendorData.category_id)
        .maybeSingle();

      const categoryRecord = categoryData as { name?: string | null } | null;
      setCategoryName(categoryRecord?.name || '');
    }

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
                {categoryName && (
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
                    <Tag size={12} /> {categoryName}
                  </span>
                )}
                {vendor.subscription_status && (
                  <span className="inline-flex items-center gap-1 mt-2 ml-2 px-3 py-1 bg-green-500/30 rounded-full text-sm">
                    {vendor.subscription_status}
                  </span>
                )}
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
                {(vendor.address || vendor.city || vendor.state || vendor.pin_code || categoryName || vendor.established_year) && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Location</p>
                      <p className="text-gray-700 font-medium">
                        {[vendor.address, vendor.city, vendor.state, vendor.pin_code].filter(Boolean).join(', ')}
                      </p>
                      {vendor.established_year && (
                        <p className="text-sm text-gray-600 mt-1">Established Year: {vendor.established_year}</p>
                      )}
                      {vendor.gst_number && (
                        <p className="text-sm text-gray-600 mt-1">GST Number: {vendor.gst_number}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {vendor.mobile_number && (
                <a href={`tel:${vendor.mobile_number}`} className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  <Phone size={18} /> Call Now
                </a>
              )}
              {vendor.whatsapp_number && (
                <a href={`https://wa.me/91${String(vendor.whatsapp_number).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
                  <MessageCircle size={18} /> WhatsApp
                </a>
              )}
            </div>

            {(vendor.website || vendor.facebook || vendor.instagram || vendor.linkedin || vendor.youtube) && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Website & Social</h2>
                <div className="flex flex-wrap gap-2">
                  {buildExternalHref(vendor.website) && (
                    <a href={buildExternalHref(vendor.website)!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Website
                    </a>
                  )}
                  {buildExternalHref(vendor.facebook) && (
                    <a href={buildExternalHref(vendor.facebook)!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Facebook
                    </a>
                  )}
                  {buildExternalHref(vendor.instagram) && (
                    <a href={buildExternalHref(vendor.instagram)!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Instagram
                    </a>
                  )}
                  {buildExternalHref(vendor.linkedin) && (
                    <a href={buildExternalHref(vendor.linkedin)!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      LinkedIn
                    </a>
                  )}
                  {buildExternalHref(vendor.youtube) && (
                    <a href={buildExternalHref(vendor.youtube)!} target="_blank" rel="noopener noreferrer" className="rounded-full border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        Moradabad Business Directory &copy; {new Date().getFullYear()} &middot; Powered by Vantage Manage
      </footer>
    </div>
  );
}
