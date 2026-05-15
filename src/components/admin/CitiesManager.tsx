import { useEffect, useState, useRef } from 'react';
import { Plus, Edit, Trash2, X, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface City {
  id: number;
  name: string;
  slug: string;
  image: string;
  tagline: string;
}

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

const emptyCity = (): Omit<City, 'id'> => ({ name: '', slug: '', image: '', tagline: '' });

export default function CitiesManager() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<City>({ id: 0, ...emptyCity() });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCities = async () => {
    setLoading(true);
    const res = await fetch(API('get_cities.php'));
    const data = await res.json();
    setCities(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchCities(); }, []);

  const filtered = cities.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.tagline?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm({ id: 0, ...emptyCity() });
    setIsEdit(false);
    setFormError('');
    setLocalImageFile(null);
    setLocalImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (c: City) => {
    setForm({ ...c });
    setIsEdit(true);
    setFormError('');
    setLocalImageFile(null);
    setLocalImagePreview(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormError('');
    setLocalImageFile(null);
    setLocalImagePreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => {
      const updated = { ...f, [name]: value };
      if (name === 'name' && !isEdit) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return updated;
    });
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setLocalImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError('City name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      let image_url = form.image;

      if (localImageFile) {
        const fd = new FormData();
        fd.append('image', localImageFile);
        if (isEdit) fd.append('cityId', String(form.id));
        const upRes = await fetch(API('upload_city_image.php'), { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (upData.success && upData.image_url) {
          image_url = upData.image_url;
        } else {
          setFormError(upData.error || 'Image upload failed.');
          setSaving(false);
          return;
        }
      }

      const payload = { id: form.id, name: form.name, slug: form.slug, hero_image_url: image_url, tagline: form.tagline };
      const url = isEdit ? API('update_city.php') : API('add_city.php');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      await fetchCities();
      closeModal();
    } catch (e: any) {
      setFormError(e.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete city "${name}"? This will not delete hotels in this city.`)) return;
    const res = await fetch(API('delete_city.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) setCities(c => c.filter(x => x.id !== id));
    else alert(data.error || 'Delete failed');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition">
          <Plus size={16} /> Add City
        </button>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search cities..."
            className="text-sm outline-none w-full"
          />
        </div>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} cities</span>
      </div>

      {/* Grid cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-40 animate-pulse" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">No cities found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {paged.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group">
              <div className="relative h-28 bg-gray-100">
                {c.image
                  ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                }
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(c)} className="p-1.5 bg-white rounded-lg shadow text-blue-600 hover:bg-blue-50"><Edit size={13} /></button>
                  <button onClick={() => handleDelete(c.id, c.name)} className="p-1.5 bg-white rounded-lg shadow text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-[#101c34] text-sm">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{c.tagline || c.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={15} /></button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={15} /></button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#101c34]">{isEdit ? 'Edit City' : 'Add City'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {localImagePreview || form.image
                      ? <img src={localImagePreview || form.image} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-xs text-gray-400">No image</span>
                    }
                  </div>
                  <div>
                    <button type="button" onClick={() => fileRef.current?.click()} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
                      {form.image || localImagePreview ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                    <p className="text-xs text-gray-400 mt-1">Recommended: 800×500px</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City Name *</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Jaipur" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input name="slug" value={form.slug} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] font-mono" placeholder="auto-generated from name" />
                <p className="text-xs text-gray-400 mt-1">Used in URLs — auto-generated from city name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input name="tagline" value={form.tagline} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. The Pink City of Rajasthan" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#101c34] text-white text-sm font-medium hover:bg-[#1a2d52] disabled:opacity-60 transition">
                <Save size={15} />
                {saving ? 'Saving...' : (isEdit ? 'Update City' : 'Add City')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
