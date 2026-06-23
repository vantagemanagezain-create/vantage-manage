'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Search, ArrowLeft, Store, Building2 } from 'lucide-react';

type Vendor = {
  id: string;
  vendor_name: string;
  slug: string;
  owner_name: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;
  active: boolean;
  categories?: { name: string };
};

export default function VendorsPage() {
  const supabase = createClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    if (urlSearch) setSearch(urlSearch);
    if (vendors.length > 0) {
      applyFilters(vendors, urlSearch || search, urlCategory);
    }
  }, [vendors, searchParams]);

  async function fetchVendors() {
    setLoading(true);
    const { data } = await supabase
      .from('vendors')
      .select('*, categories(name)')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (data) {
      setVendors(data);
      const urlSearch = searchParams.get('search') || '';
      const urlCategory = searchParams.get('category') || '';
      applyFilters(data, urlSearch, urlCategory);
    }
    setLoading(false);
  }

  function applyFilters(list: Vendor[], searchTerm: string, category: string) {
    let result = list;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.vendor_name?.toLowerCase().includes(q) ||
          v.area?.toLowerCase().includes(q) ||
          v.owner_name?.toLowerCase().includes(q) ||
          v.categories?.name?.toLowerCase().includes(q)
      );
    }
    if (category) {
      result = result.filter((v) =>
        v.categories?.name?.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
      );
    }
    setFiltered(result);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(vendors, search, searchParams.get('category') || '');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-800"><ArrowLeft size={20} /></Link>
          <div className="flex items-center gap-2">
            <Store className="text-blue-600" size={22} />
            <span className="font-bold text-lg text-gray-900">Vantage Manage</span>
          </div>
        </div>
        <Link href="/admin" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Admin</Link>
      </header>

      <div className="bg-white border-b px-6 py-4">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search vendors, areas, categories..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); applyFilters(vendors, e.target.value, searchParams.get('category') || ''); }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-blue-700">Search</button>
        </form>
        {(searchParams.get('category') || searchParams.get('search')) && (
          <div className="max-w-2xl mx-auto mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Filtering by:</span>
            {searchParams.get('category') && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{searchParams.get('category')}</span>}
            {searchParams.get('search') && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">"{searchParams.get('search')}"</span>}
            <Link href="/vendors" className="text-xs text-red-500 hover:underline">Clear</Link>
          </div>
        )}
      </div>

      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-gray-500 mb-4">
            {loading ? 'Loading...' : `${filtered.length} vendor${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {loading ? (
            <div className="text-center py-16 text-gray-400">
              <Store size={40} className="mx-auto mb-3 animate-pulse" />
              <p>Loading vendors...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-40" />
              <p>No vendors found. Try a different search.</p>
              <Link href="/vendors" className="text-blue-600 text-sm hover:underline mt-2 inline-block">View all vendors</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((vendor) => (
                <Link key={vendor.id} href={`/vendors/${vendor.slug}`} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Store size={18} className="text-blue-600" />
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mt-2">{vendor.vendor_name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{vendor.categories?.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <MapPin size={11} />{vendor.area}
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
      </main>

      <footer className="bg-gray-900 text-gray-400 text-center py-4 text-xs">
        Moradabad Business Directory &copy; {new Date().getFullYear()} &middot; Powered by Vantage Manage
      </footer>
    </div>
  );
}
