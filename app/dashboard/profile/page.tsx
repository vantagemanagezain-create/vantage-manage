'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';

type Category = { id: string; name: string };

const INPUT_CLASS = 'w-full bg-white border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
const LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-1';

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendorId, setVendorId] = useState('');

  const [form, setForm] = useState({
    vendor_name: '',
    owner_name: '',
    category_id: '',
    mobile_number: '',
    whatsapp_number: '',
    email: '',
    area: '',
    address: '',
    state: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchVendor();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    if (data) setCategories(data);
  }

  async function fetchVendor() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      router.push('/login');
      return;
    }
    const { data, error: fetchError } = await supabase
      .from('vendors')
      .select('id, vendor_name, owner_name, category_id, mobile_number, whatsapp_number, email, area, address, state, description')
      .eq('user_id', session.user.id)
      .single();

    if (fetchError || !data) {
      setError('Vendor profile not found.');
      setLoading(false);
      return;
    }

    setVendorId(data.id);
    setForm({
      vendor_name: data.vendor_name || '',
      owner_name: data.owner_name || '',
      category_id: data.category_id || '',
      mobile_number: data.mobile_number || '',
      whatsapp_number: data.whatsapp_number || '',
      email: data.email || '',
      area: data.area || '',
      address: data.address || '',
      state: data.state || '',
      description: data.description || '',
    });
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      router.push('/login');
      return;
    }

    const { error: saveError } = await supabase
      .from('vendors')
      .update({
        vendor_name: form.vendor_name,
        owner_name: form.owner_name,
        category_id: form.category_id || null,
        mobile_number: form.mobile_number,
        whatsapp_number: form.whatsapp_number,
        email: form.email,
        area: form.area,
        address: form.address,
        state: form.state,
        description: form.description,
      })
      .eq('user_id', session.user.id);

    setSaving(false);

    if (saveError) {
      setError('Save failed: ' + saveError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your business information</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
            <CheckCircle className="w-4 h-4" />
            Profile updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className={LABEL_CLASS}>Business Name *</label>
            <input name="vendor_name" value={form.vendor_name} onChange={handleChange} required className={INPUT_CLASS} placeholder="e.g. City Electrical" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Owner Name</label>
            <input name="owner_name" value={form.owner_name} onChange={handleChange} className={INPUT_CLASS} placeholder="Owner full name" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Category</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className={INPUT_CLASS}>
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Mobile Number</label>
            <input name="mobile_number" value={form.mobile_number} onChange={handleChange} className={INPUT_CLASS} placeholder="9XXXXXXXXX" />
          </div>
          <div>
            <label className={LABEL_CLASS}>WhatsApp Number</label>
            <input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} className={INPUT_CLASS} placeholder="9XXXXXXXXX" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={INPUT_CLASS} placeholder="you@example.com" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Area</label>
            <input name="area" value={form.area} onChange={handleChange} className={INPUT_CLASS} placeholder="e.g. Cantonment" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Address</label>
            <input name="address" value={form.address} onChange={handleChange} className={INPUT_CLASS} placeholder="Full address" />
          </div>
          <div>
            <label className={LABEL_CLASS}>State</label>
            <input name="state" value={form.state} onChange={handleChange} className={INPUT_CLASS} placeholder="e.g. Uttar Pradesh" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={INPUT_CLASS} placeholder="Brief description of services" />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
