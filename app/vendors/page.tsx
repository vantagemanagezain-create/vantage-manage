'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Search } from 'lucide-react';

type Vendor = {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  mobile_number: string;
  whatsapp_number: string;
  area: string;
  profile_image: string;
  active: boolean;
  categories?: { name: string };
};

export default function VendorsPage() {
  const supabase = createClient();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filtered, setFiltered] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      const { data } = await supabase
        .from('vendors')
        .select(
          'id, name, slug, owner_name, mobile_number, whatsapp_number, area, profile_image, active, categories(name)'
        )
        .eq('active', true)
        .order('name');
      if (data) {
        setVendors(data);
        setFiltered(data);
      }
      setLoading(false);
    }
    fetchVendors();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          (v.owner_name || '').toLowerCase().includes(q) ||
          (v.area || '').toLowerCase().includes(q) ||
          (v.categories?.name || '').toLowerCase().includes(q)
      )
    );
  }, [search, vendors]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Moradabad Business Directory
          </h1>
          <p className="text-gray-500 mb-4">
            Find local vendors and businesses in Moradabad
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors, categories, areas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-400 py-16">
            Loading vendors...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            No vendors found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {vendor.profile_image ? (
                      <img
                        src={vendor.profile_image}
                        alt={vendor.name}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-blue-600">
                          {vendor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {vendor.name}
                      </h2>
                      {vendor.categories?.name && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {vendor.categories.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {vendor.owner_name && (
                    <p className="text-sm text-gray-500 mb-1">
                      {vendor.owner_name}
                    </p>
                  )}
                  {vendor.area && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <MapPin size={12} /> {vendor.area}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {vendor.mobile_number && (
                      <a
                        href={`tel:${vendor.mobile_number}`}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded text-xs"
                      >
                        <Phone size={12} /> Call
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
                        className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-1.5 rounded text-xs"
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/vendors/${vendor.slug}`}
                      className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded text-xs"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-8">
          {filtered.length} vendors found
        </p>
      </div>
    </div>
  );
}
