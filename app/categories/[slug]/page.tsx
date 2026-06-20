'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, MessageCircle, MapPin, Tag } from 'lucide-react';

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
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();
  const [category, setCategory] = useState<Category | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (!cat) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCategory(cat);

      const { data: vends } = await supabase
        .from('vendors')
        .select(
          'id, name, slug, owner_name, mobile_number, whatsapp_number, area, profile_image, active'
        )
        .eq('category_id', cat.id)
        .eq('active', true)
        .order('name');

      if (vends) setVendors(vends);
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  if (notFound || !category)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Category not found.</p>
        <Link href="/vendors" className="text-blue-600 hover:underline">
          Back to Directory
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <Link
            href="/vendors"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-3"
          >
            <ArrowLeft size={16} /> Back to Directory
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Tag className="text-blue-600" size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-gray-500 text-sm">{category.description}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {vendors.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg">No vendors in this category yet.</p>
            <Link
              href="/vendors"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Browse all vendors
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((vendor) => (
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
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {vendor.name}
                      </h2>
                      {vendor.owner_name && (
                        <p className="text-xs text-gray-500">
                          {vendor.owner_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {vendor.area && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                      <MapPin size={12} /> {vendor.area}
                    </div>
                  )}

                  <div className="flex gap-2">
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
      </div>
    </div>
  );
}
