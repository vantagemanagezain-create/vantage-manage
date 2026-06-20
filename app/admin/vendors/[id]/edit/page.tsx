'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Trash2, RefreshCw } from 'lucide-react';

type Category = { id: string; name: string };

const MORADABAD_CITY_ID = 'df4a1678-8a52-4994-8b26-367ecc0f9c60';

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
    name: '',
    slug: '',
    owner_name: '',
    category_id: '',
    mobile_number: '',
    whatsapp_number: '',
    area: '',
    address: '',
    state: '',
    description: '',
    active: true,
    profile_image: '',
    city_id: MORADABAD_CITY_ID,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchVendor();
  }, [id]);

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
    if (data) setCategories(data);
  }

  async function fetchVendor() {
    setLoading(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) {
      setError('Vendor not found');
      setLoading(false);
      return;
    }
    setForm({
      name: data.name || '',
      slug: data.slug || '',
      owner_name: data.owner_name || '',
      category_id: data.category_id || '',
      mobile_number: data.mobile_number || '',
      whatsapp_number: data.whatsapp_number || '',
      area: data.area || '',
      address: data.address || '',
      state: data.state || '',
      description: data.description || '',
      active: data.active ?? true,
      profile_image: data.profile_image || '',
      city_id: data.city_id || MORADABAD_CITY_ID,
    });
    if (data.profile_image) setImagePreview(data.profile_image);
    setLoading(false);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' ? { slug: slugify(value) } : {}),
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
      setError('Image upload failed: ' + uploadError.message);
      return null;
    }
    const { data: urlData } = supabase.storage
      .from('vendor-images')
      .getPublicUrl(fileName);
    return urlData.publicUrl;
  }

  async function removeImage() {
    if (form.profile_image) {
      const fileName = form.profile_image.split('/').pop();
      if (fileName) {
        await supabase.storage.from('vendor-images').remove([fileName]);
      }
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

    const { error: saveError } = await supabase
      .from('vendors')
      .update({
        name: form.name,
        slug: form.slug,
        owner_name: form.owner_name,
        category_id: form.category_id || null,
        mobile_number: form.mobile_number,
        whatsapp_number: form.whatsapp_number,
        area: form.area,
        address: form.address,
        state: form.state,
        description: form.description,
        active: form.active,
        profile_image: imageUrl,
        city_id: MORADABAD_CITY_ID,
      })
      .eq('id', id);

    setSaving(false);
    if (saveError) {
      setError('Save failed: ' + saveError.message);
    } else {
      setSuccess('Vendor updated successfully!');
      setForm((prev) => ({ ...prev, profile_image: imageUrl }));
      setImageFile(null);
      setTimeout(() => router.push('/admin/vendors'), 1500);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading vendor...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/vendors"
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Edit Vendor</h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Vendor Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Owner Name</label>
          <input
            name="owner_name"
            value={form.owner_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mobile Number
            </label>
            <input
              name="mobile_number"
              value={form.mobile_number}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Number
            </label>
            <input
              name="whatsapp_number"
              value={form.whatsapp_number}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Area</label>
            <input
              name="area"
              value={form.area}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            id="active"
            checked={form.active}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label htmlFor="active" className="text-sm font-medium">
            Active
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Vendor Logo</label>
          {imagePreview && (
            <div className="mb-3 flex items-start gap-3">
              <img
                src={imagePreview}
                alt="Logo preview"
                className="w-24 h-24 object-cover rounded border"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <RefreshCw size={14} /> Replace
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          )}
          {!imagePreview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded px-4 py-3 text-gray-500 hover:border-gray-400 hover:text-gray-600"
            >
              <Upload size={16} /> Upload Logo
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving
              ? 'Saving...'
              : uploadingImage
              ? 'Uploading...'
              : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
