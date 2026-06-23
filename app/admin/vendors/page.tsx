'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  Plus, Search, Pencil, Trash2, Eye, Phone, MessageCircle, CheckCircle, Clock, XCircle, Calendar
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
  subscription_status: string;
  subscription_plan: string;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_status: string;
  categories?: {
    name: string;
  } | null;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const supabase = createClient();

  const fetchVendors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('vendors')
      .select(
        'id, vendor_name, slug, owner_name, mobile_number, whatsapp_number, area, address, state, description, active, profile_image, category_id, subscription_status, subscription_plan, subscription_start, subscription_end, payment_status, categories(name)'
      )
      .order('vendor_name');
    // @ts-ignore
    setVendors((data as unknown as Vendor[]) || []);
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

  const activateSubscription = async (id: string) => {
    const now = new Date();
    const oneYearLater = new Date(now.setFullYear(now.getFullYear() + 1));
    await supabase
      .from('vendors')
      .update({
        subscription_status: 'active',
        payment_status: 'paid',
        subscription_start: new Date().toISOString(),
        subscription_end: oneYearLater.toISOString(),
      })
      .eq('id', id);
    fetchVendors();
  };

  const deactivateSubscription = async (id: string) => {
    await supabase
      .from('vendors')
      .update({
        subscription_status: 'inactive',
      })
      .eq('id', id);
    fetchVendors();
  };

  const extendSubscription = async (id: string, days: number) => {
    const vendor = vendors.find(v => v.id === id);
    if (!vendor || !vendor.subscription_end) return;
    const currentEnd = new Date(vendor.subscription_end);
    const newEnd = new Date(currentEnd.setDate(currentEnd.getDate() + days));
    await supabase
      .from('vendors')
      .update({
        subscription_end: newEnd.toISOString(),
      })
      .eq('id', id);
    fetchVendors();
  };

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      (v.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.area || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.mobile_number || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.subscription_status === 'active').length;
  const inactiveVendors = vendors.filter(v => v.subscription_status === 'inactive').length;
  const expiredVendors = vendors.filter(v => v.subscription_status === 'expired').length;
  const pendingVendors = vendors.filter(v => v.subscription_status === 'pending').length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Active</span>;
      case 'expired':
        return <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={10} /> Expired</span>;
      case 'pending':
        return <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full"><Clock size={10} /> Pending</span>;
      default:
        return <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-sm text-gray-400 mt-1">{vendors.length} vendors total</p>
        </div>
        <Link
          href="/admin/vendors/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Vendor
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total</div>
          <div className="text-2xl font-bold mt-1">{totalVendors}</div>
        </div>
        <div className="bg-gray-900 border border-green-900/30 rounded-lg p-4">
          <div className="text-sm text-green-400">Active</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{activeVendors}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Inactive</div>
          <div className="text-2xl font-bold mt-1">{inactiveVendors}</div>
        </div>
        <div className="bg-gray-900 border border-red-900/30 rounded-lg p-4">
          <div className="text-sm text-red-400">Expired</div>
          <div className="text-2xl font-bold text-red-400 mt-1">{expiredVendors}</div>
        </div>
        <div className="bg-gray-900 border border-yellow-900/30 rounded-lg p-4">
          <div className="text-sm text-yellow-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">{pendingVendors}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor, owner, area, mobile..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {search ? 'No vendors match your search.' : 'No vendors found. Add your first vendor!'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr className="text-left text-xs text-gray-400">
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-800/50">
                  {/* Vendor */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {vendor.profile_image ? (
                        <img
                          src={vendor.profile_image}
                          alt={vendor.vendor_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {getInitials(vendor.vendor_name)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{vendor.vendor_name}</div>
                        {vendor.owner_name && (
                          <div className="text-xs text-gray-400">{vendor.owner_name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Category */}
                  <td className="px-4 py-3 text-sm">
                    {vendor.categories?.name || 'Uncategorized'}
                  </td>
                  {/* Mobile */}
                  <td className="px-4 py-3 text-sm">
                    {vendor.mobile_number ? (
                      <a
                        href={`tel:${vendor.mobile_number}`}
                        className="text-blue-400 hover:underline"
                      >
                        {vendor.mobile_number}
                      </a>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  {/* Subscription */}
                  <td className="px-4 py-3">{getStatusBadge(vendor.subscription_status)}</td>
                  {/* Expires */}
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {formatDate(vendor.subscription_end)}
                  </td>
                  {/* Area */}
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {vendor.area || '—'} {vendor.state || ''}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {vendor.whatsapp_number && (
                        <a
                          href={`https://wa.me/91${vendor.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </a>
                      )}
                      <Link
                        href={`/admin/vendors/${vendor.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      {vendor.subscription_status === 'active' ? (
                        <button
                          onClick={() => deactivateSubscription(vendor.id)}
                          className="px-2 py-1 text-xs bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded transition-colors"
                          title="Deactivate"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateSubscription(vendor.id)}
                          className="px-2 py-1 text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded transition-colors"
                          title="Activate for 1 year"
                        >
                          Activate
                        </button>
                      )}
                      {vendor.subscription_status === 'active' && (
                        <button
                          onClick={() => extendSubscription(vendor.id, 30)}
                          className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded transition-colors"
                          title="Extend +30 days"
                        >
                          +30d
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmDelete(vendor.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Delete Vendor?</h3>
            <p className="text-sm text-gray-400 mb-6">
              Yeh action undo nahi ho sakta. Vendor permanently delete ho jayega.
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
