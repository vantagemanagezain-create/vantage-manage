'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, MessageCircle, CheckCircle, Clock, XCircle, Timer } from 'lucide-react';

type Category = { id: string; name: string };

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
  profile_image: string | null;
  subscription_status: string;
  subscription_plan: string;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_status: string;
  categories?: { name: string } | null;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [extendMenu, setExtendMenu] = useState<string | null>(null);
  const supabase = createClient();

  const fetchVendors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('id, vendor_name, slug, owner_name, mobile_number, whatsapp_number, area, address, state, description, profile_image, category_id, subscription_status, subscription_plan, subscription_start, subscription_end, payment_status, categories(name)')
      .order('vendor_name');
    setVendors((data as unknown as Vendor[]) || []);
    if (error) console.error('Vendors fetch error:', error);
    setLoading(false);
  };

  useEffect(() => {
    fetchVendors();
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
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
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const { error } = await supabase.from('vendors').update({
      subscription_status: 'active',
      payment_status: 'paid',
      subscription_start: now.toISOString(),
      subscription_end: oneYearLater.toISOString(),
    }).eq('id', id);
    if (error) {
      console.error('Activate subscription error:', error);
      alert(`Activate failed: ${error.message}`);
      return;
    }
    fetchVendors();
  };

  const suspendSubscription = async (id: string) => {
    const { error } = await supabase.from('vendors').update({
      subscription_status: 'suspended',
      payment_status: 'unpaid',
    }).eq('id', id);
    if (error) {
      console.error('Suspend subscription error:', error);
      alert(`Suspend failed: ${error.message}`);
      return;
    }
    fetchVendors();
  };

  const extendSubscription = async (id: string, days: number) => {
    const vendor = vendors.find(v => v.id === id);
    if (!vendor) return;
    const currentEnd = vendor.subscription_end ? new Date(vendor.subscription_end) : new Date();
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + days);
    const { error } = await supabase.from('vendors').update({
      subscription_end: newEnd.toISOString(),
      subscription_status: 'active',
    }).eq('id', id);
    if (error) {
      console.error('Extend subscription error:', error);
      alert(`Extend failed: ${error.message}`);
      return;
    }
    setExtendMenu(null);
    fetchVendors();
  };

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      (v.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.area || '').toLowerCase().includes(search.toLowerCase()) ||
      (v.mobile_number || '').includes(search);
    const matchesStatus = statusFilter === 'all' || v.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.subscription_status === 'active').length;
  const inactiveVendors = vendors.filter(v => v.subscription_status === 'inactive').length;
  const expiredVendors = vendors.filter(v => v.subscription_status === 'expired').length;
  const pendingVendors = vendors.filter(v => v.subscription_status === 'pending').length;

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 flex items-center gap-1"><CheckCircle size={10} /> Active</span>;
      case 'expired': return <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 flex items-center gap-1"><XCircle size={10} /> Expired</span>;
      case 'pending': return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 flex items-center gap-1"><Clock size={10} /> Pending</span>;
      case 'suspended': return <span className="px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-400 flex items-center gap-1"><XCircle size={10} /> Suspended</span>;
      default: return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400 flex items-center gap-1"><XCircle size={10} /> Inactive</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vendors</h1>
          <p className="text-gray-400 text-sm mt-1">{vendors.length} vendors total</p>
        </div>
        <Link href="/admin/vendors/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
          <Plus size={16} /> Add Vendor
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{totalVendors}</p><p className="text-gray-400 text-xs mt-1">Total</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-green-400">{activeVendors}</p><p className="text-gray-400 text-xs mt-1">Active</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-gray-400">{inactiveVendors}</p><p className="text-gray-400 text-xs mt-1">Inactive</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-red-400">{expiredVendors}</p><p className="text-gray-400 text-xs mt-1">Expired</p></div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-yellow-400">{pendingVendors}</p><p className="text-gray-400 text-xs mt-1">Pending</p></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by vendor, owner, area, mobile..." className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading vendors...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{search ? 'No vendors match your search.' : 'No vendors found. Add your first vendor!'}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Vendor</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Mobile</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Subscription</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Expires</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Location</th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {vendor.profile_image ? (
                        <img src={vendor.profile_image} alt={vendor.vendor_name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(vendor.vendor_name)}</div>
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{vendor.vendor_name}</p>
                        {vendor.owner_name && <p className="text-gray-400 text-xs">{vendor.owner_name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{vendor.categories?.name || 'Uncategorized'}</td>
                  <td className="py-3 px-4">
                    {vendor.mobile_number ? (
                      <a href={`tel:${vendor.mobile_number}`} className="text-blue-400 text-sm hover:underline">{vendor.mobile_number}</a>
                    ) : <span className="text-gray-600 text-sm">—</span>}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(vendor.subscription_status)}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{formatDate(vendor.subscription_end)}</td>
                  <td className="py-3 px-4">
                    <p className="text-gray-300 text-sm">{vendor.area || '—'}</p>
                    {vendor.state && <p className="text-gray-500 text-xs">{vendor.state}</p>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {vendor.whatsapp_number && (
                        <a href={`https://wa.me/91${vendor.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-green-400 hover:bg-gray-800 rounded-lg transition-colors"><MessageCircle size={14} /></a>
                      )}
                      <Link href={`/admin/vendors/${vendor.id}`} className="p-1.5 text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"><Pencil size={14} /></Link>

                      {vendor.subscription_status === 'active' ? (
                        <button onClick={() => suspendSubscription(vendor.id)} className="px-2 py-1 text-xs bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded transition-colors" title="Suspend">Suspend</button>
                      ) : vendor.subscription_status === 'suspended' ? (
                        <button onClick={() => activateSubscription(vendor.id)} className="px-2 py-1 text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded transition-colors" title="Activate for 1 year">Activate</button>
                      ) : (
                        <>
                          <button onClick={() => activateSubscription(vendor.id)} className="px-2 py-1 text-xs bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded transition-colors" title="Activate for 1 year">Activate</button>
                          <button onClick={async () => { const { error } = await supabase.from('vendors').update({ subscription_status: 'inactive' }).eq('id', vendor.id); if (error) { alert(`Failed: ${error.message}`); return; } fetchVendors(); }} className="px-2 py-1 text-xs bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 rounded transition-colors" title="Mark Inactive">Inactive</button>
                        </>
                      )}

                      {(vendor.subscription_status === 'active' || vendor.subscription_status === 'expired') && (
                        <div className="relative">
                          <button onClick={() => setExtendMenu(extendMenu === vendor.id ? null : vendor.id)} className="px-2 py-1 text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded transition-colors flex items-center gap-1" title="Extend subscription"><Timer size={10} /> Extend</button>
                          {extendMenu === vendor.id && (
                            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-32">
                              <button onClick={() => extendSubscription(vendor.id, 30)} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gray-700">+30 days</button>
                              <button onClick={() => extendSubscription(vendor.id, 90)} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gray-700">+90 days</button>
                              <button onClick={() => extendSubscription(vendor.id, 180)} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gray-700">+180 days</button>
                              <button onClick={() => extendSubscription(vendor.id, 365)} className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-gray-700">+1 year</button>
                            </div>
                          )}
                        </div>
                      )}

                      <button onClick={() => setConfirmDelete(vendor.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Delete Vendor?</h3>
            <p className="text-gray-400 text-sm mb-4">Yeh action undo nahi ho sakta. Vendor permanently delete ho jayega.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-sm transition-colors">{deletingId === confirmDelete ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
