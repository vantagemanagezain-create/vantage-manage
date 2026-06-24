'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, ArrowLeft } from 'lucide-react';

export default function RegisterBusinessPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    vendor_name: '',
    owner_name: '',
    email: '',
    password: '',
    mobile_number: '',
    whatsapp_number: '',
    area: '',
    address: '',
    state: 'Uttar Pradesh',
    description: '',
    category_id: '',
    subcategory_id: '',
    city_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Step 1: Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes('rate limit')) {
          setError('Bahut zyada attempts ho gaye. Please 5-10 minute wait karke dobara try karein.');
          setLoading(false);
          return;
        }
        throw authError;
      }

      // Step 2: Create vendor record with pending subscription
      const slug = formData.vendor_name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { error: insertError } = await supabase.from('vendors').insert({
        vendor_name: formData.vendor_name,
        slug: slug,
        owner_name: formData.owner_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        whatsapp_number: formData.whatsapp_number,
        area: formData.area,
        address: formData.address,
        state: formData.state,
        description: formData.description,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        city_id: formData.city_id || null,
        subscription_status: 'pending',
        payment_status: 'unpaid',
        subscription_plan: 'basic',
        active: false,
        user_id: authData.user?.id,
      });

      if (insertError) throw insertError;

      // Success - redirect to dashboard
      router.push('/dashboard?registered=true');
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('rate limit')) {
        setError('Bahut zyada attempts ho gaye. Please 5-10 minute wait karke dobara try karein.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Store className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold">Vantage Manage</h1>
          </div>
          <p className="text-gray-400 text-sm">Register your business on Moradabad Business Directory</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-5">Register Your Business</h2>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Name *</label>
              <input
                type="text"
                required
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Enter your business name"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Owner Name *</label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Your full name"
              />
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Min 6 characters"
                  minLength={6}
                />
              </div>
            </div>

            {/* Mobile & WhatsApp */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Area/Locality *</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                placeholder="e.g., Majhola, Civil Lines"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Complete address"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Business Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Tell customers about your business"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Creating Account...' : 'Register Business'}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:underline">Login here</Link>
            </p>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Your business will be reviewed by our team. Subscription activation required for public listing.
        </p>
      </div>
    </div>
  );
}
