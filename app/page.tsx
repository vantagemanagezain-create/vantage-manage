'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Store, ArrowRight, MapPin, Search, Phone, MessageCircle, Building2, Tag } from 'lucide-react';

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
  active: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function HomePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchLatestVendors();
    fetchCategories();
    fetchTotalCount();
  }, []);

  async function fetchLatestVendors() {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('active', true)
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
      .eq('active', true);
    if (count !== null) setTotalCount(count);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/vendors?search=${encodeURIComponent(searchQuery.trim())}`;
    } else {
      window.location.href = '/vendors';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO BANNER - House Ad */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white text-center py-3 px-4">
        <p className="text-sm font-semibold">
          Vantage Manage &mdash; Moradabad&apos;s Fastest Growing Business Directory &bull;{' '}
          <Link href="/register-business" className="underline font-bold">Register Your Business</Link>
          {' '}&bull;{' '}
          <Link href="/vendors" className="underline">Browse Directory</Link>
        </p>
      </div>

      {/* TOP NAV */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-900 text-lg">Vantage Manage</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Moradabad, Uttar Pradesh</span>
          <Link href="/admin" className="text-blue-600 hover:underline font-medium">Directory Admin</Link>
        </div>
      </nav>

      {/* HERO SEARCH SECTION */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-4 py-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Moradabad Business Directory</h1>
        <p className="text-blue-100 mb-6 text-sm">Find local vendors, shops and businesses. Connect directly via call or WhatsApp.</p>
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors, shops, businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button type="submit" className="bg-white text-blue-600 font-semibold px-5 py-3 rounded-xl hover:bg-blue-50 text-sm">
            Search
          </button>
        </form>
        <p className="text-blue-200 text-xs mt-4">{totalCount}+ businesses listed</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* CATEGORIES */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Popular Categories</h2>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/vendors?category=${cat.slug}`}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Tag className="w-4 h-4 text-blue-500" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* MID BANNER - House Ad */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-5 text-center shadow">
          <h3 className="font-bold text-lg mb-1">Promote Your Business Online</h3>
          <p className="text-sm text-indigo-100 mb-3">Verified listings, WhatsApp leads, and local visibility &mdash; Founding Member Plan at just <strong>&#8377;499/year</strong></p>
          <Link href="/register-business" className="inline-block bg-white text-indigo-700 font-bold text-sm px-5 py-2 rounded-xl hover:bg-indigo-50 transition">
            Get Listed Today
          </Link>
        </div>

        {/* LATEST VENDORS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Latest Vendors</h2>
            <Link href="/vendors" className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {vendors.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No vendors yet. Add from Admin panel.</div>
          ) : (
            <div className="space-y-3">
              {vendors.map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.slug}`} className="block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold text-gray-900 text-sm">{vendor.vendor_name}</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{vendor.category}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vendor.area}</span>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${vendor.mobile_number}`} onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                    <a href={`https://wa.me/${vendor.whatsapp_number}`} onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-xs py-1.5 rounded-lg hover:bg-green-600">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* REGISTER YOUR BUSINESS - Fixed Wording */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Get Your Business Listed in Moradabad&apos;s Trusted Directory</h2>
          <p className="text-gray-500 text-sm mb-1">Verified business profiles, WhatsApp leads, and local visibility for manufacturers, exporters, suppliers, and service providers.</p>
          <p className="text-blue-600 font-semibold text-sm mb-4">Founding Member Plan &bull; &#8377;499/year</p>
          <Link
            href="/register-business"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Register Your Business <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* FOOTER BANNER - House Ad */}
      <div className="bg-gray-800 text-white text-center py-4 px-4">
        <p className="text-sm font-semibold mb-1">Vantage Manage Business Network</p>
        <p className="text-gray-400 text-xs mb-2">Connecting manufacturers, suppliers, exporters and service providers across Moradabad.</p>
        <Link href="/register-business" className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
          Register Your Business
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 text-center py-3 text-xs">
        Moradabad Business Directory &copy; {new Date().getFullYear()} &middot; Powered by Vantage Manage
      </footer>
    </div>
  );
}
