'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Trash2, RefreshCw } from 'lucide-react';

type Category = { id: string; name: string };

const MORADABAD_CITY_ID = 'df4a1678-8a52-4994-8b26-367ecc0f9c60';

const INPUT_CLASS = 'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
const LABEL_CLASS = 'block text-sm font-medium text-gray-300 mb-1';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    vendor_name: '',
    slug: '',
    owner_name: '',
    category_id: '',
    mobile_number: '',
    whatsapp_number: '',
    area: '',
    address: '',
    state: '',
    description: '',
    profile_image: '',
    city_id: MORADABAD_CITY_ID,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchVendor();
  }, [id]);

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('id, name').order('name');
    if (data) setCategories(data);
  }

  async function fetchVendor() {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('vendors').select('*').eq('id', id).single();
    if (fetchError || !data) {
      console.error('fetchVendor error:', fetchError);
      setError('Vendor not found');
      setLoading(false);
      return;
    }
    setForm({
      vendor_name: data.vendor_name || '',
      slug: data.slug || '',
      owner_name: data.owner_name || '',
      category_id: data.category_id || '',
      mobile_number: data.mobile_number || '',
      whatsapp_number: data.whatsapp_number || '',
      area: data.area || '',
      address: data.address || '',
      state: data.state || '',
      description: data.description || '',
      profile_image: data.profile_image || '',
      city_id: data.city_id || MORADABAD_CITY_ID,
    });
    if (data.profile_image) setImagePreview(data.profile_image);
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'vendor_name' ? { slug: slugify(value) } : {}),
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(): Promise<string | null> {
    if (!imageFile) return form.profile_image || null;
    setUploadingImage(true);
    const ext = imageFile.name.split('.').pop();
    const fileName = `vendor-${id}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('vendor-images')
      .upload(fileName, imageFile, { upsert: true });
    setUploadingImage(false);
    if (uploadError) {
      console.error('uploadImage error:', uploadError);
      setError('Image upload failed: ' + uploadError.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from('vendor-images').getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  async function removeImage() {
    if (form.profile_image) {
      const fileName = form.profile_image.split('/').pop();
      if (fileName) await supabase.storage.from('vendor-images').remove([fileName]);
    }
    setForm((prev) => ({ ...prev, profile_image: '' }));
    setImagePreview('');
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    let imageUrl = form.profile_image;
    if (imageFile) {
      const uploaded = await uploadImage();
      if (!uploaded) {
        setSaving(false);
        return;
      }
      imageUrl = uploaded;
    }
    const { error: saveError } = await supabase.from('vendors').update({
      vendor_name: form.vendor_name,
      slug: form.slug,
      owner_name: form.owner_name,
      category_id: form.category_id || null,
      mobile_number: form.mobile_number,
      whatsapp_number: form.whatsapp_number,
      area: form.area,
      address: form.address,
      state: form.state,
      description: form.description,
      profile_image: imageUrl,
      city_id: MORADABAD_CITY_ID,
    }).eq('id', id);
    setSaving(false);
    if (saveError) {
      console.error('handleSubmit saveError:', saveError);
      setError('Save failed: ' + saveError.message);
    } else {
      setSuccess('Vendor updated successfully!');
      setForm((prev) => ({ ...prev, profile_image: imageUrl }));
      setImageFile(null);
      setTimeout(() => router.push('/admin/vendors'), 1500);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-400">Loading vendor...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/vendors" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Edit Vendor</h1>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Vendor Name *</label>
            <input name="vendor_name" value={form.vendor_name} onChange={handleChange} required className={INPUT_CLASS} placeholder="e.g. City Electrical" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className={`${INPUT_CLASS} text-gray-400`} placeholder="auto-generated" />
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
            <label className={LABEL_CLASS}>Area</label>
            <input name="area" value={form.area} onChange={handleChange} className={INPUT_CLASS} placeholder="e.g. Cantonment" />
          </div>
          <div>
            <label className={LABEL_CLASS}>State</label>
            <input name="state" value={form.state} onChange={handleChange} className={INPUT_CLASS} placeholder="e.g. Uttar Pradesh" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Address</label>
            <input name="address" value={form.address} onChange={handleChange} className={INPUT_CLASS} placeholder="Full address" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={INPUT_CLASS} placeholder="Brief description of services" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Vendor Logo</label>
            {imagePreview ? (
              <div className="flex items-start gap-4">
                <img src={imagePreview} alt="Logo preview" className="w-24 h-24 object-cover rounded-lg border border-gray-700" />
                <div className="flex flex-col gap-2 mt-1">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                    <RefreshCw size={14} /> Replace
                  </button>
                  <button type="button" onClick={removeImage} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 border-2 border-dashed border-gray-700 rounded-lg px-4 py-3 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors">
                <Upload size={16} /> Upload Logo
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={saving || uploadingImage} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors">
              <Save size={16} />
              {saving ? 'Saving...' : uploadingImage ? 'Uploading...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
