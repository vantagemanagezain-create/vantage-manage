import Link from 'next/link';
import { Store, ArrowRight, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="text-blue-600" size={24} />
          <span className="font-bold text-xl text-gray-900">
            Vantage Manage
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vendors"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            Directory
          </Link>
          <Link
            href="/admin"
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-blue-600" size={20} />
          <span className="text-blue-600 font-medium">
            Moradabad, Uttar Pradesh
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          Moradabad Business
          <br />
          Directory
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md">
          Find local vendors, shops and businesses in Moradabad. Connect
          directly via call or WhatsApp.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/vendors"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Browse Directory <ArrowRight size={20} />
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg font-semibold text-lg"
          >
            Admin Panel
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-6">
        Moradabad Business Directory &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
