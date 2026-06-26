'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Search, Store, CheckCircle } from 'lucide-react';

type Vendor = {
  id: string;
  vendor_name: string;
  slug: string;
  owner_name: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;

  subscription_status: string;
  subscription_plan: string;
  subscription_end: string | null;
  categories?: { name: string };
};

function VendorsContent() {
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
    const now = new Date().toISOString();
    const { data } = await supabase
      .from('vendors')
      .select('id, vendor_name, slug, owner_name, mobile_number, whatsapp_number, area, subscription_status, subscription_plan, subscription_end, categories(name)')
      
      .eq('subscription_status', 'active')
      .or(`subscription_end.is.null,subscription_end.gt.${now}`)
      .order('created_at', { ascending: false });
    if (data) {
      // @ts-ignore
      setVendors(data);
      const urlSearch = searchParams.get('search') || '';
      const urlCategory = searchParams.get('category') || '';
      // @ts-ignore
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
      result = result.filter(
        (v) => v.categories?.name?.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
      );
    }
    setFiltered(result);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters(vendors, search, searchParams.get('category') || '');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Store className="text-blue-600" /> Vantage Manage
          </Link>
          <Link href="/admin" className="text-sm font-medium text-gray-600">Admin</Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto p-4">
        <form onSubmit={handleSearch} className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search vendors, areas, categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              applyFilters(vendors, e.target.value, searchParams.get('category') || '');
            }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
        {(searchParams.get('category') || searchParams.get('search')) && (
          <div className="flex items-center gap-2 mb-4 text-xs">
            <span className="text-gray-500">Filtering by:</span>
            {searchParams.get('category') && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{searchParams.get('category')}</span>}
            {searchParams.get('search') && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{searchParams.get('search')}</span>}
            <Link href="/vendors" className="text-gray-400 underline">Clear</Link>
          </div>
        )}
        <div className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : `${filtered.length} verified vendor${filtered.length !== 1 ? 's' : ''} found`}
        </div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No verified vendors found. Try a different search.
            <br />
            <Link href="/vendors" className="text-blue-600 underline text-sm mt-2 block">View all vendors</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((vendor) => (
              <Link key={vendor.id} href={`/vendors/${vendor.slug}`} className="block">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{vendor.vendor_name}</h3>
                      <p className="text-xs text-gray-500 mb-1">{vendor.categories?.name}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <CheckCircle size={10} /> Verified
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                    <MapPin size={12} /> {vendor.area}
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
                    <a href={`tel:${vendor.mobile_number}`} className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white text-xs py-1.5 rounded-lg hover:bg-blue-700">
                      <Phone size={14} /> Call
                    </a>
                    <a href={`https://wa.me/${vendor.whatsapp_number}`} className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white text-xs py-1.5 rounded-lg hover:bg-green-600">
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <footer className="text-center text-xs text-gray-400 py-8">
        Moradabad Business Directory
      </footer>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <VendorsContent />
    </Suspense>
  );
}
