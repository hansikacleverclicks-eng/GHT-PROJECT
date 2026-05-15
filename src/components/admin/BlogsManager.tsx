import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, X, Save, Search, ChevronLeft, ChevronRight, Filter, Upload } from 'lucide-react';
import BulkUpload from './BulkUpload';

interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  category: string;
  city: string;
  author: string;
  tags?: string;
  created_at?: string;
  views?: number;
  featured?: boolean;
}

const CATEGORIES = ['General', 'Wedding Ideas', 'Corporate Events', 'Destination Weddings', 'Venue Spotlights', 'Travel', 'Tourism'];
const CITIES = ['All Cities', 'Delhi', 'Jaipur', 'Udaipur', 'Agra', 'Amritsar', 'Mumbai', 'Goa', 'Bangalore', 'Chennai', 'Hyderabad'];

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

const emptyBlog = (): Omit<Blog, 'id'> => ({
  title: '', content: '', image_url: '', category: 'General',
  city: 'All Cities', author: 'Admin', tags: '', featured: false
});

export default function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [bulkOpen, setBulkOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Partial<Blog> & { id?: number }>(emptyBlog());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API('current_affairs.php'));
      const data = await res.json();
      setBlogs(Array.isArray(data.data) ? data.data : []);
    } catch { setBlogs([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const filtered = blogs.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.title.toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q);
    const matchCat = !filterCategory || b.category === filterCategory;
    const matchCity = !filterCity || b.city === filterCity;
    return matchSearch && matchCat && matchCity;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm(emptyBlog());
    setIsEdit(false);
    setFormError('');
    setLocalPreview(null);
    setLocalFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };

  const openEdit = (b: Blog) => {
    setForm({ ...b });
    setIsEdit(true);
    setFormError('');
    setLocalPreview(null);
    setLocalFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setFormError(''); setLocalPreview(null); setLocalFile(null); };

  const set = (field: keyof Blog, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title?.trim()) { setFormError('Title is required.'); return; }
    if (!form.content?.trim()) { setFormError('Content is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      let image_url = form.image_url || '';

      if (isEdit) {
        // Upload image first if a new file was selected (we have the ID)
        if (localFile && form.id) {
          const fd = new FormData();
          fd.append('image', localFile);
          const upRes = await fetch(API('upload_blog_image.php'), { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (upData.success && upData.imageUrl) image_url = upData.imageUrl;
          else { setFormError(upData.error || 'Image upload failed.'); setSaving(false); return; }
        }
        const res = await fetch(API('current_affairs.php'), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, image_url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Update failed');
      } else {
        // Save blog first to get ID, then upload image
        const res = await fetch(API('current_affairs.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, image_url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Save failed');
        if (localFile) {
          const fd = new FormData();
          fd.append('image', localFile);
          const upRes = await fetch(API('upload_blog_image.php'), { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (!upData.success) setFormError('Blog saved, but image upload failed: ' + (upData.error || 'Unknown error'));
        }
      }

      await fetchBlogs();
      closeModal();
    } catch (e: any) {
      setFormError(e.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(API('current_affairs.php'), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) setBlogs(b => b.filter(x => x.id !== id));
    else alert(data.message || 'Delete failed');
  };

  return (
    <div className="space-y-4">
      {/* Bulk Upload Panel */}
      {bulkOpen && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#101c34]">Bulk Upload Blogs</h3>
            <button onClick={() => setBulkOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><X size={16} /></button>
          </div>
          <BulkUpload type="blogs" onDone={() => { setBulkOpen(false); fetchBlogs(); }} />
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition">
          <Plus size={16} /> Add Blog
        </button>
        <button onClick={() => setBulkOpen(v => !v)} className="flex items-center gap-2 border border-[#101c34] text-[#101c34] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#101c34] hover:text-white transition">
          <Upload size={15} /> Bulk Upload
        </button>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search blogs..." className="text-sm outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
            <option value="">All Cities</option>
            {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} blogs</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No blogs found.</td></tr>
              ) : paged.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {b.image_url
                      ? <img src={b.image_url} alt={b.title} className="w-14 h-10 object-cover rounded-lg border" />
                      : <div className="w-14 h-10 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-300 text-xs">No img</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-[#101c34] max-w-[200px]">
                    <span className="line-clamp-2">{b.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e8ebf3] text-[#101c34] text-xs px-2 py-1 rounded-full">{b.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{b.city}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{b.author}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{b.views ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(b.id, b.title)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={15} /></button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#101c34]">{isEdit ? 'Edit Blog' : 'Add Blog'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title || ''} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Blog title" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-24 h-16 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {localPreview
                      ? <img src={localPreview} alt="preview" className="w-full h-full object-cover" />
                      : form.image_url
                        ? <img src={form.image_url} alt="cover" className="w-full h-full object-cover" />
                        : <span className="text-xs text-gray-400">No image</span>
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                      <Upload size={14} /> Upload Image
                    </button>
                    {localPreview && <span className="text-xs text-green-600">New image selected — will upload on save</span>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { setLocalFile(file); setLocalPreview(URL.createObjectURL(file)); }
                    }}
                  />
                </div>
                <input value={form.image_url || ''} onChange={e => { set('image_url', e.target.value); setLocalPreview(null); setLocalFile(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Or paste image URL here" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category || 'General'} onChange={e => set('category', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select value={form.city || 'All Cities'} onChange={e => set('city', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input value={form.author || ''} onChange={e => set('author', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="GHT Team" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input value={form.tags || ''} onChange={e => set('tags', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="tourism, hotels, delhi" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea value={form.content || ''} onChange={e => set('content', e.target.value)} rows={10} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-y font-mono" placeholder="Write blog content here..." />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => set('featured', !form.featured)} className={`w-11 h-6 rounded-full relative transition-colors ${form.featured ? 'bg-[#101c34]' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.featured ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#101c34] text-white text-sm font-medium hover:bg-[#1a2d52] disabled:opacity-60 transition">
                <Save size={15} />
                {saving ? 'Saving...' : (isEdit ? 'Update Blog' : 'Publish Blog')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
