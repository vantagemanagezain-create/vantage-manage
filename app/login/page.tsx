'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, ArrowLeft, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'email' | 'mobile'>('email');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let authEmail = email;
      if (loginType === 'mobile') {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('email')
          .eq('mobile_number', mobile.trim())
          .single();
        if (vendorError || !vendorData) {
          throw new Error('Invalid email/mobile number or password.');
        }
        authEmail = vendorData.email;
      }
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });
      if (authError) throw new Error('Invalid email/mobile number or password.');
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email/mobile number or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Vantage Manage</h1>
          </div>
          <p className="text-gray-500">Login to your vendor dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vendor Login</h2>

          <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => { setLoginType('email'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                loginType === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('mobile'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                loginType === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:text-gray-800'
              }`}
            >
              Mobile Number
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {loginType === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  autoComplete="tel"
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register-business" className="text-blue-600 hover:text-blue-700 font-medium">
              Register your business
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Secure login powered by Supabase Auth
        </p>
      </div>
    </div>
  );
}
