'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Camera, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Category = {
  id: string;
  name: string;
};

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

type FormState = {
  businessName: string;
  categoryId: string;
  description: string;
  establishedYear: string;
  gstNumber: string;
  contactPerson: string;
  mobileNumber: string;
  whatsappNumber: string;
  website: string;
  area: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  profileImage: string;
  slug: string;
};

const sanitizeTextValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  return String(value).trim();
};

export default function VendorProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [toast, setToast] = useState<ToastState>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const profileImageObjectUrl = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<FormState>({
    businessName: '',
    categoryId: '',
    description: '',
    establishedYear: '',
    gstNumber: '',
    contactPerson: '',
    mobileNumber: '',
    whatsappNumber: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
    profileImage: '',
    slug: '',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setToast(null);

      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

      if (!userEmail) {
        setToast({ type: 'error', message: 'Please log in to edit your profile.' });
        setLoading(false);
        return;
      }

      setEmail(userEmail);

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (categoriesData) {
        setCategories(categoriesData as Category[]);
      }

      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select(
          'id, vendor_name, owner_name, category_id, mobile_number, whatsapp_number, email, area, address, city, state, pin_code, description, established_year, gst_number, website, facebook, instagram, linkedin, youtube, profile_image, slug'
        )
        .eq('email', userEmail)
        .single();

      if (vendorError || !vendorData) {
        setToast({ type: 'error', message: 'Unable to load your profile.' });
        setLoading(false);
        return;
      }

      const record = vendorData as Record<string, unknown>;
      setVendorId(record.id as string);
      setForm({
        businessName: sanitizeTextValue(record.vendor_name),
        categoryId: sanitizeTextValue(record.category_id),
        description: sanitizeTextValue(record.description),
        establishedYear: sanitizeTextValue(record.established_year),
        gstNumber: sanitizeTextValue(record.gst_number),
        contactPerson: sanitizeTextValue(record.owner_name),
        mobileNumber: sanitizeTextValue(record.mobile_number),
        whatsappNumber: sanitizeTextValue(record.whatsapp_number),
        website: sanitizeTextValue(record.website),
        area: sanitizeTextValue(record.area),
        address: sanitizeTextValue(record.address),
        city: sanitizeTextValue(record.city),
        state: sanitizeTextValue(record.state),
        pinCode: sanitizeTextValue(record.pin_code),
        facebook: sanitizeTextValue(record.facebook),
        instagram: sanitizeTextValue(record.instagram),
        linkedin: sanitizeTextValue(record.linkedin),
        youtube: sanitizeTextValue(record.youtube),
        profileImage: sanitizeTextValue(record.profile_image),
        slug: sanitizeTextValue(record.slug),
      });
      if (record.profile_image) {
        setProfileImagePreview(String(record.profile_image));
      }
      setLoading(false);
    };

    loadData();
  }, [supabase]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setToast({ type: 'error', message: 'Please select a JPG, PNG, or WEBP image.' });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setToast({ type: 'error', message: 'Image must be 5MB or smaller.' });
      return;
    }

    if (profileImageObjectUrl.current) {
      URL.revokeObjectURL(profileImageObjectUrl.current);
    }

    const previewUrl = URL.createObjectURL(file);
    profileImageObjectUrl.current = previewUrl;
    setProfileImageFile(file);
    setProfileImagePreview(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (profileImageObjectUrl.current) {
        URL.revokeObjectURL(profileImageObjectUrl.current);
      }
    };
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.businessName.trim() || !form.categoryId || !form.mobileNumber.trim()) {
      setToast({ type: 'error', message: 'Business name, category, and mobile number are required.' });
      return;
    }

    if (!vendorId) {
      setToast({ type: 'error', message: 'Vendor profile could not be found.' });
      return;
    }

    setSaving(true);
    setToast(null);

    const updatePayload: Record<string, string | number | null> = {
      vendor_name: sanitizeTextValue(form.businessName) || null,
      slug: sanitizeTextValue(form.slug) || null,
      owner_name: sanitizeTextValue(form.contactPerson) || null,
      description: sanitizeTextValue(form.description) || null,
      category_id: form.categoryId || null,
      mobile_number: sanitizeTextValue(form.mobileNumber) || null,
      whatsapp_number: sanitizeTextValue(form.whatsappNumber) || null,
      area: sanitizeTextValue(form.area) || null,
      address: sanitizeTextValue(form.address) || null,
      city: sanitizeTextValue(form.city) || null,
      state: sanitizeTextValue(form.state) || null,
      pin_code: sanitizeTextValue(form.pinCode) || null,
      gst_number: sanitizeTextValue(form.gstNumber) || null,
      website: sanitizeTextValue(form.website) || null,
      facebook: sanitizeTextValue(form.facebook) || null,
      instagram: sanitizeTextValue(form.instagram) || null,
      linkedin: sanitizeTextValue(form.linkedin) || null,
      youtube: sanitizeTextValue(form.youtube) || null,
      profile_image: sanitizeTextValue(form.profileImage) || null,
      established_year: null,
    };

    async function uploadSelectedImage() {
      if (!profileImageFile || !vendorId) return form.profileImage || null;

      const ext = profileImageFile.name.split('.').pop();
      const fileName = `vendor-${vendorId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('vendor-images')
        .upload(fileName, profileImageFile, { upsert: true });

      if (uploadError) {
        return Promise.reject(uploadError.message);
      }

      const { data: urlData, error: urlError } = supabase.storage
        .from('vendor-images')
        .getPublicUrl(fileName);

      if (urlError || !urlData?.publicUrl) {
        return Promise.reject(urlError?.message || 'Failed to get uploaded image URL.');
      }

      return urlData.publicUrl;
    }

    const trimmedYear = sanitizeTextValue(form.establishedYear);
    if (trimmedYear) {
      const parsedYear = Number.parseInt(trimmedYear, 10);
      if (Number.isNaN(parsedYear)) {
        setToast({ type: 'error', message: 'Established year must be a valid integer year.' });
        setSaving(false);
        return;
      }
      updatePayload.established_year = parsedYear;
    }

    try {
      if (profileImageFile) {
        try {
          const uploadedUrl = await uploadSelectedImage();
          updatePayload.profile_image = uploadedUrl;
        } catch (uploadError) {
          setToast({ type: 'error', message: String(uploadError) });
          setSaving(false);
          return;
        }
      }

      const result = await supabase
        .from('vendors')
        .update(updatePayload)
        .eq('id', vendorId)
        .select();

      if (result.error) {
        setToast({ type: 'error', message: result.error.message || 'Failed to save profile.' });
      } else {
        const updatedUrl = updatePayload.profile_image ? String(updatePayload.profile_image) : form.profileImage;
        setForm((prev) => ({ ...prev, profileImage: updatedUrl }));
        setProfileImagePreview(updatedUrl || '');
        setProfileImageFile(null);
        if (profileImageObjectUrl.current) {
          URL.revokeObjectURL(profileImageObjectUrl.current);
          profileImageObjectUrl.current = null;
        }
        setToast({ type: 'success', message: 'Profile updated successfully.' });
      }
    } catch (error) {
      console.error('Profile save failed:', error);
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred while saving your profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-sm text-gray-500 mt-1">Update your business information and public profile details.</p>
          </div>
        </div>

        {toast && (
          <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {toast.message}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Loading your profile...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                      <input
                        type="text"
                        name="businessName"
                        value={form.businessName}
                        onChange={handleChange}
                        placeholder="Enter business name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Established Year</label>
                      <input
                        type="text"
                        name="establishedYear"
                        value={form.establishedYear}
                        onChange={handleChange}
                        placeholder="e.g. 2018"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                      <textarea
                        rows={4}
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe your business"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (optional)</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={form.gstNumber}
                        onChange={handleChange}
                        placeholder="Enter GST number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={form.contactPerson}
                        onChange={handleChange}
                        placeholder="Enter owner name"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                      <input
                        type="text"
                        name="whatsappNumber"
                        value={form.whatsappNumber}
                        onChange={handleChange}
                        placeholder="Enter WhatsApp number"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Address</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                      <input
                        type="text"
                        name="area"
                        value={form.area}
                        onChange={handleChange}
                        placeholder="Enter area"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        rows={3}
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={form.pinCode}
                        onChange={handleChange}
                        placeholder="Enter PIN code"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Social Links</h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input
                        type="text"
                        name="facebook"
                        value={form.facebook}
                        onChange={handleChange}
                        placeholder="https://facebook.com/"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="text"
                        name="instagram"
                        value={form.instagram}
                        onChange={handleChange}
                        placeholder="https://instagram.com/"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <input
                        type="text"
                        name="linkedin"
                        value={form.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                      <input
                        type="text"
                        name="youtube"
                        value={form.youtube}
                        onChange={handleChange}
                        placeholder="https://youtube.com/"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Business Profile Image</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload a profile image for your public vendor page.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="h-40 overflow-hidden rounded-2xl bg-gray-100 flex items-center justify-center">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm text-gray-500">No profile image selected</span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Choose Image
                        </button>
                        <p className="text-xs text-gray-500">JPG, PNG or WEBP — Max 5MB</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile URL</h2>
                  <p className="text-sm text-gray-500 mt-1">Share your public profile link.</p>
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-700 break-all">https://vantagemanage.com/vendors/{form.slug || 'vendor-slug'}</p>
                  </div>
                  <button
                    type="button"
                    className="mt-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                </section>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
