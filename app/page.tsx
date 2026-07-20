
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Store, ArrowRight, MapPin, Search, Phone, MessageCircle, Building2, Tag, Mail } from 'lucide-react';

type Vendor = {
  id: string;
  vendor_name: string;
  slug: string;
  owner_name: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;
  category: string;
  description: string;
  
};

type Category = {
  id: string;
  name: string;
  slug: string;
};
type Advertisement = {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  position: string;
is_active: boolean;
starts_at: string;
  expires_at: string;
};

export default function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
    const [ads, setAds] = useState<Advertisement[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchLatestVendors();
    fetchCategories();
    fetchTotalCount();
    fetchAds();
  }, []);

  async function fetchLatestVendors() {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setVendors(data);
  }

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
      .limit(8);
    if (data) setCategories(data);
  }

  async function fetchTotalCount() {
    const { count } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      ;
    if (count !== null) setTotalCount(count);
  }
  async function fetchAds() {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('advertisements')
      .select('*')
      .eq('is_active', true)
      .lte('starts_at', today)
      .gte('expires_at', today);
    if (data) setAds(data);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/vendors?search=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = '/vendors';
    }
  }
  const headerAd = ads.find(a => a.position === 'header');
  const heroAd = ads.find(a => a.position === 'hero');
  const bottomAd = ads.find(a => a.position === 'bottom');

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* HERO BANNER - Ticker */}
      <div className="bg-blue-700 text-white text-xs py-2 px-4 text-center">
          {headerAd ? (
            <a href={headerAd.target_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              {headerAd.image_url && <img src={headerAd.image_url} alt={headerAd.title} className="h-24 object-cover" />}
              <span className="font-semibold">{headerAd.title}</span>
            </a>
          ) : (
            <>Vantage Manage — Moradabad's Fastest Growing Business Directory •{' '}
            <Link href="/register-business" className="underline font-semibold">Register Your Business</Link>{' '}
            •{' '}
            <Link href="/vendors" className="underline">Browse Directory</Link></>
          )}
      </div>

      {/* TOP NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg">Vantage Manage</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />Moradabad, Uttar Pradesh</span>
          <Link href="/vendors" className="hover:text-white">Directory</Link>
          <Link href="/login" className="hover:text-white">Vendor Login</Link>
        </div>
      </nav>

      {/* HERO SEARCH SECTION */}
      <section className="px-6 py-14 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Moradabad Business Directory</h1>
        <p className="text-gray-400 mb-8">Find local vendors, shops and businesses. Connect directly via call or WhatsApp.</p>
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors, shops, businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button type="submit" className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-medium">Search</button>
        </form>
        <p className="text-gray-500 text-xs mt-4">{totalCount}+ businesses listed</p>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="px-6 pb-10 max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Popular Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/vendors?category=${cat.slug}`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full text-sm">
                <Tag className="w-4 h-4 text-blue-400" />
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

              {heroAd && (
          <div className="mx-6 my-8">
            <a href={heroAd.target_url} target="_blank" rel="noopener noreferrer" className="block rounded-2xl overflow-hidden">
              {heroAd.image_url ? (
                <img src={heroAd.image_url} alt={heroAd.title} className="w-full max-h-48 object-cover" />
              ) : (
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center rounded-2xl">
                  <p className="text-xl font-bold">{heroAd.title}</p>
                </div>
              )}
            </a>
          </div>
        )}

{/* MID BANNER - Advertise With Us */}
      <section className="mx-6 my-8 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center max-w-5xl md:mx-auto">
        <p className="text-xs uppercase tracking-widest mb-2 opacity-80">Advertisement Space</p>
        <h2 className="text-2xl font-bold mb-3">Your Business Could Be Here</h2>
        <p className="text-sm mb-5 opacity-90">Promote your business on the homepage of Moradabad’s fastest growing business directory.</p>
        <a
          href="https://wa.me/919259180235?text=Hi%2C%20I%20want%20to%20advertise%20on%20Vantage%20Manage%20homepage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-orange-50"
        >
          <MessageCircle className="w-4 h-4" />
          Advertise With Us
        </a>
      </section>

      {/* LATEST VENDORS */}
      <section className="px-6 pb-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Latest Vendors</h2>
          <Link href="/vendors" className="flex items-center gap-1 text-blue-400 text-sm hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {vendors.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No vendors yet. Add from Admin panel.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.slug}`} className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold">
                    {vendor.vendor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{vendor.vendor_name}</p>
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-3 mb-3">
                  {vendor.category && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{vendor.category}</span>}
                  {vendor.area && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor.area}</span>}
                </div>
                <div className="flex gap-2">
                  <a onClick={(e) => e.stopPropagation()} href={`tel:${vendor.mobile_number}`} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <a onClick={(e) => e.stopPropagation()} href={`https://wa.me/91${vendor.whatsapp_number.replace(/\D/g, '')}`} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-xs py-1.5 rounded-lg hover:bg-green-600">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* REGISTER YOUR BUSINESS */}
      <section className="mx-6 my-8 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white max-w-5xl md:mx-auto">
        <h2 className="text-2xl font-bold mb-3">Get Your Business Listed in Moradabad’s Trusted Directory</h2>
        <p className="text-sm mb-2 opacity-90">Verified business profiles, WhatsApp leads, and local visibility for manufacturers, exporters, suppliers, and service providers.</p>
        <p className="font-semibold mb-5">Founding Member Plan • ₹499/year</p>
        <Link href="/register-business" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-blue-50">
          Register Your Business <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* FOOTER BANNER - Contact Us */}
      <section className="mx-6 mt-8 mb-4 rounded-2xl bg-gray-900 p-8 text-center max-w-5xl md:mx-auto">
        <Building2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Contact Vantage Manage</h3>
        <p className="text-gray-400 text-sm mb-4">Connecting manufacturers, suppliers, exporters and service providers across Moradabad.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="tel:+919259180235" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-full text-sm">
            <Phone className="w-4 h-4 text-blue-400" />
            +91 92591 80235
          </a>
          <a href="https://wa.me/919259180235" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-900 hover:bg-green-800 px-5 py-2.5 rounded-full text-sm">
            <MessageCircle className="w-4 h-4 text-green-400" />
            WhatsApp
          </a>
          <a href="mailto:vantagemanageofficial@gmail.com" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-5 py-2.5 rounded-full text-sm">
            <Mail className="w-4 h-4 text-blue-400" />
            vantagemanageofficial@gmail.com
          </a>
        </div>
      </section>

              {bottomAd && (
          <div className="w-full">
            <a href={bottomAd.target_url} target="_blank" rel="noopener noreferrer" className="block">
              {bottomAd.image_url ? (
                <img src={bottomAd.image_url} alt={bottomAd.title} className="w-full h-56 object-cover" />
              ) : (
                <div className="bg-gray-800 text-white text-center py-4 font-semibold">{bottomAd.title}</div>
              )}
            </a>
          </div>
        )}

        {/* FOOTER */}
      <footer className="text-center text-xs text-gray-600 py-6">
        Moradabad Business Directory © {new Date().getFullYear()} · Powered by Vantage Manage
      </footer>

    </div>
  );
}
