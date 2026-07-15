'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Ad = {
  id: string;
  title: string;
  position: 'header' | 'hero' | 'bottom';
  image_url: string | null;
  target_url: string | null;
  is_active: boolean;
  validity_days: number;
  starts_at: string;
  expires_at: string;
};

export default function AdvertisementsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    position: 'header' as 'header' | 'hero' | 'bottom',
    image_url: '',
    target_url: '',
    is_active: true,
    validity_days: 7,
  });

  const fetchAds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });
    setAds(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const resetForm = () => {
    setForm({ title: '', position: 'header', image_url: '', target_url: '', is_active: true, validity_days: 7 });
    setEditingAd(null);
    setShowForm(false);
  };

  const handleEdit = (ad: Ad) => {
    setForm({
      title: ad.title,
      position: ad.position,
      image_url: ad.image_url || '',
      target_url: ad.target_url || '',
      is_active: ad.is_active,
      validity_days: ad.validity_days,
    });
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('ad-images')
      .upload(fileName, file, { upsert: true });
    if (!error && data) {
      const { data: urlData } = supabase.storage.from('ad-images').getPublicUrl(fileName);
      setForm(f => ({ ...f, image_url: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      position: form.position,
      image_url: form.image_url || null,
      target_url: form.target_url || null,
      is_active: form.is_active,
      validity_days: form.validity_days,
      starts_at: editingAd ? editingAd.starts_at : new Date().toISOString(),
    };
    if (editingAd) {
      await supabase.from('advertisements').update(payload).eq('id', editingAd.id);
    } else {
      await supabase.from('advertisements').insert([payload]);
    }
    resetForm();
    fetchAds();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this advertisement?')) return;
    await supabase.from('advertisements').delete().eq('id', id);
    fetchAds();
  };

  const toggleActive = async (ad: Ad) => {
    await supabase.from('advertisements').update({ is_active: !ad.is_active }).eq('id', ad.id);
    fetchAds();
  };

  const getRemainingDays = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Advertisement Management</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Add Advertisement
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingAd ? 'Edit Advertisement' : 'Add Advertisement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Position</label>
                <select
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value as 'header' | 'hero' | 'bottom' }))}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                >
                  <option value="header">Header Banner</option>
                  <option value="hero">Hero Banner</option>
                  <option value="bottom">Bottom Banner</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">Upload Image</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full mt-1 text-sm text-gray-300" />
                {uploading && <p className="text-xs text-blue-400 mt-1">Uploading...</p>}
                {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 rounded object-cover" />}
              </div>
              <div>
                <label className="text-xs text-gray-400">Target URL</label>
                <input
                  type="url"
                  value={form.target_url}
                  onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))}
                  placeholder="https://"
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Validity (days): {form.validity_days}</label>
                <input
                  type="range"
                  min={1} max={30}
                  value={form.validity_days}
                  onChange={e => setForm(f => ({ ...f, validity_days: Number(e.target.value) }))}
                  className="w-full mt-1"
                />
                <div className="flex justify-between text-xs text-gray-500"><span>1</span><span>30</span></div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-300">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  {editingAd ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-400">No advertisements yet.</p>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className={`flex items-center gap-4 bg-gray-900 border rounded-xl p-4 ${
              isExpired(ad.expires_at) ? 'border-red-800 opacity-60' : 'border-gray-700'
            }`}>
              {ad.image_url && (
                <img src={ad.image_url} alt={ad.title} className="w-24 h-14 rounded object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{ad.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="capitalize">{ad.position}</span> ·{' '}
                  {isExpired(ad.expires_at) ? (
                    <span className="text-red-400">Expired</span>
                  ) : (
                    <span className="text-green-400">{getRemainingDays(ad.expires_at)} days left</span>
                  )}
                </p>
                {ad.target_url && <p className="text-xs text-blue-400 truncate mt-0.5">{ad.target_url}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(ad)}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    ad.is_active ? 'bg-green-700 text-green-100' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {ad.is_active ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => handleEdit(ad)} className="px-3 py-1 bg-blue-700 text-white rounded text-xs">Edit</button>
                <button onClick={() => handleDelete(ad.id)} className="px-3 py-1 bg-red-700 text-white rounded text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
