'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '' });

  const supabase = createClient();

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    setCategories(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleSave() {
    if (!form.name.trim()) return;
    const slug = form.slug || slugify(form.name);
    if (editItem) {
      await supabase
        .from('categories')
        .update({ name: form.name, slug, icon: form.icon || null })
        .eq('id', editItem.id);
      setSuccessMsg('Category updated!');
    } else {
      await supabase
        .from('categories')
        .insert({
          name: form.name,
          slug,
          icon: form.icon || null,
          active: true,
          sort_order: 0,
        });
      setSuccessMsg('Category added!');
    }
    setShowModal(false);
    setEditItem(null);
    setForm({ name: '', slug: '', icon: '' });
    fetchCategories();
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function handleDelete(id: string) {
    await supabase.from('categories').delete().eq('id', id);
    setDeleteId(null);
    setSuccessMsg('Category deleted!');
    fetchCategories();
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function toggleActive(cat: Category) {
    await supabase
      .from('categories')
      .update({ active: !cat.active })
      .eq('id', cat.id);
    fetchCategories();
  }

  function openEdit(cat: Category) {
    setEditItem(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon || '' });
    setShowModal(true);
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">
            {categories.length} categories total
          </p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setForm({ name: '', slug: '', icon: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-900/40 border border-green-700 text-green-300 px-4 py-2 rounded-lg text-sm">
          {successMsg}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No categories found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-300 font-medium">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-gray-300 font-medium">
                  Slug
                </th>
                <th className="text-left px-4 py-3 text-gray-300 font-medium">
                  Icon
                </th>
                <th className="text-center px-4 py-3 text-gray-300 font-medium">
                  Active
                </th>
                <th className="text-right px-4 py-3 text-gray-300 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filtered.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{cat.icon || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(cat)}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {cat.active ? (
                        <ToggleRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-1.5 hover:bg-red-900/40 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {editItem ? 'Edit Category' : 'Add Category'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: slugify(e.target.value),
                    }))
                  }
                  placeholder="e.g. Dhalai (Casting)"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="auto-generated"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Icon (emoji or text)
                </label>
                <input
                  value={form.icon}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, icon: e.target.value }))
                  }
                  placeholder="e.g. 🔥 or Factory"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {editItem ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Delete Category?
            </h2>
            <p className="text-gray-400 text-sm">
              Yeh action undo nahi hogi. Pakka delete karna hai?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
