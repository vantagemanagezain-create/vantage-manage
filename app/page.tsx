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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Store className="text-blue-600" size={24} />
          <span className="font-bold text-xl text-gray-900">Vantage Manage</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/vendors" className="text-sm text-gray-600 hover:text-blue-600">Directory</Link>
          <Link href="/admin" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Admin</Link>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MapPin size={18} />
            <span className="text-blue-200 text-sm">Moradabad, Uttar Pradesh</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Moradabad Business Directory</h1>
          <p className="text-blue-100 text-lg mb-8">Find local vendors, shops and businesses. Connect directly via call or WhatsApp.</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search vendors, shops, businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button type="submit" className="bg-white text-blue-600 font-semibold px-5 py-3 rounded-xl hover:bg-blue-50">
              Search
            </button>
          </form>
          <p className="mt-4 text-blue-200 text-sm">{totalCount}+ businesses listed</p>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-10 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Tag size={22} className="text-blue-600" />
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/vendors?category=${cat.slug}`}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-4 py-3 text-center text-sm font-medium text-blue-700 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={22} className="text-blue-600" />
              Latest Vendors
            </h2>
            <Link href="/vendors" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {vendors.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-40" />
              <p>No vendors yet. Add from Admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.slug}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Store size={18} className="text-blue-600" />
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-2">{vendor.vendor_name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{vendor.category}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin size={11} />
                    {vendor.area}
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${vendor.mobile_number}`} onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                      <Phone size={12} /> Call
                    </a>
                    <a href={`https://wa.me/${vendor.whatsapp_number}`} onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-xs py-1.5 rounded-lg hover:bg-green-600">
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-auto py-10 px-6 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">Add Your Business</h2>
        <p className="text-blue-100 mb-4">List your business for free and reach local customers.</p>
        <Link href="/admin" className="inline-block bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50">
          Add Business
        </Link>
      </section>

      <footer className="bg-gray-900 text-gray-400 text-center py-4 text-xs">
        Moradabad Business Directory &copy; {new Date().getFullYear()} &middot; Powered by Vantage Manage
      </footer>
    </div>
  );
}
