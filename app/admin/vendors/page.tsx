'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Phone,
  MessageCircle,
} from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

type Vendor = {
  id: string;
  vendor_name: string;
  slug: string;
  owner_name: string | null;
  mobile_number: string | null;
  whatsapp_number: string | null;
  area: string | null;
  address: string | null;
  state: string | null;
  description: string | null;
  category_id: string | null;
  active: boolean;
  profile_image: string | null;
  categories?: {
    name: string;
  } | null;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const supabase = createClient();

  const fetchVendors = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('vendors')
      .select(
        'id, vendor_name, slug, owner_name, mobile_number, whatsapp_number, area, address, state, description, active, profile_image, category_id, categories(name)'
      )
      .order('vendor_name');

    setVendors((data as Vendor[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();

    supabase
      .from('categories')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        setCategories(data || []);
      });
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    await supabase.from('vendors').delete().eq('id', id);

    setConfirmDelete(null);
    setDeletingId(null);

    fetchVendors();
  };

  const filtered = vendors.filter(
    (v) =>
      v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      (v.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.area || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.mobile_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Vendors</h2>

          <p className="text-gray-400 text-sm mt-1">
            {vendors.length} vendors total
          </p>
        </div>

        <Link
          href="/admin/vendors/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Vendor
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor, owner, area, mobile..."
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Loading vendors...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            {search
              ? 'No vendors match your search.'
              : 'No vendors found. Add your first vendor!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Logo
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Vendor
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Mobile
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Area
                  </th>

                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {filtered.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Logo */}
                    <td className="px-4 py-3">
                      {vendor.profile_image ? (
                        <img
                          src={vendor.profile_image}
                          alt={vendor.vendor_name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                          {getInitials(vendor.vendor_name)}
                        </div>
                      )}
                    </td>

                    {/* Vendor */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-white text-sm">
                        {vendor.vendor_name}
                      </div>

                      {vendor.owner_name && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {vendor.owner_name}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-900/40 text-blue-300 border border-blue-800/50 px-2 py-1 rounded-full">
                        {vendor.categories?.name || 'Uncategorized'}
                      </span>
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3">
                      {vendor.mobile_number ? (
                        <a
                          href={`tel:${vendor.mobile_number}`}
                          className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                        >
                          <Phone className="w-3 h-3" />
                          {vendor.mobile_number}
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          vendor.active
                            ? 'bg-green-900/30 text-green-400 border-green-800'
                            : 'bg-red-900/30 text-red-400 border-red-800'
                        }`}
                      >
                        {vendor.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Area */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">
                        {vendor.area || '—'}
                      </div>

                      <div className="text-xs text-gray-500">
                        {vendor.state || ''}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {vendor.whatsapp_number && (
                          <a
                            href={`https://wa.me/91${vendor.whatsapp_number}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/admin/vendors/${vendor.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setConfirmDelete(vendor.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-white font-semibold text-lg mb-2">
              Delete Vendor?
            </h3>

            <p className="text-gray-400 text-sm mb-6">
              Yeh action undo nahi ho sakta. Vendor permanently delete ho
              jayega.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm transition-colors"
              >
                {deletingId === confirmDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
