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
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Vantage Manage</h1>
          </div>
          <p className="text-gray-400">Login to your vendor dashboard</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <LogIn className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Vendor Login</h2>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-700 mb-6">
            <button
              type="button"
              onClick={() => { setLoginType('email'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                loginType === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginType('mobile'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                loginType === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Mobile Number
            </button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginType === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  autoComplete="tel"
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Signing in...' : 'Login to Dashboard'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register-business" className="text-blue-400 hover:text-blue-300 transition-colors">
              Register your business
            </Link>
          </p>
          <p className="text-center text-gray-600 text-xs mt-4">Secure login powered by Supabase Auth</p>
        </div>
      </div>
    </div>
  );
}
