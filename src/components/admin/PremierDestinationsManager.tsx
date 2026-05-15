import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, X, Save, Search, ChevronLeft, ChevronRight, MapPin, Eye, EyeOff } from 'lucide-react';

interface Destination {
  id: number;
  title: string;
  region: string;
  city: string;
  description: string;
  image_url: string;
  sort_order: number;
  active: number;
}

const REGIONS = ['Delhi NCR', 'Uttarakhand', 'Rajasthan', 'Goa', 'Kerala', 'Maharashtra', 'Other'];

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

const empty = (): Omit<Destination, 'id'> => ({
  title: '', region: 'Delhi NCR', city: '', description: '', image_url: '', sort_order: 0, active: 1
});

export default function PremierDestinationsManager() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Destination>({ id: 0, ...empty() });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API('premier_destinations.php'));
    const data = await res.json();
    setDestinations(Array.isArray(data.data) ? data.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDestinations(); }, [fetchDestinations]);

  const filtered = destinations.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q || d.title.toLowerCase().includes(q) || d.city?.toLowerCase().includes(q) || d.region?.toLowerCase().includes(q);
    const matchRegion = !filterRegion || d.region === filterRegion;
    return matchSearch && matchRegion;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm({ id: 0, ...empty() }); setIsEdit(false); setFormError(''); setLocalImageFile(null); setLocalImagePreview(null); setModalOpen(true); };
  const openEdit = (d: Destination) => { setForm({ ...d }); setIsEdit(true); setFormError(''); setLocalImageFile(null); setLocalImagePreview(null); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setFormError(''); setLocalImageFile(null); setLocalImagePreview(null); };
  const set = (field: keyof Destination, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setLocalImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Title is required.'); return; }
    if (!form.region) { setFormError('Region is required.'); return; }
    setSaving(true); setFormError('');
    try {
      let image_url = form.image_url;

      if (localImageFile) {
        const fd = new FormData();
        fd.append('image', localImageFile);
        const upRes = await fetch(API('upload_city_image.php'), { method: 'POST', body: fd });
        const upData = await upRes.json();
        if (upData.success && upData.image_url) image_url = upData.image_url;
      }

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(API('premier_destinations.php'), {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, image_url })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Save failed');
      await fetchDestinations(); closeModal();
    } catch (e: any) { setFormError(e.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(API('premier_destinations.php'), { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) setDestinations(d => d.filter(x => x.id !== id));
    else alert(data.error || 'Delete failed');
  };

  const toggleActive = async (d: Destination) => {
    const res = await fetch(API('premier_destinations.php'), {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...d, active: d.active ? 0 : 1 })
    });
    const data = await res.json();
    if (data.success) setDestinations(ds => ds.map(x => x.id === d.id ? { ...x, active: x.active ? 0 : 1 } : x));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition">
          <Plus size={16} /> Add Destination
        </button>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search destinations..." className="text-sm outline-none w-full" />
        </div>
        <select value={filterRegion} onChange={e => { setFilterRegion(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} destinations</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-44 animate-pulse" />)}
        </div>
      ) : paged.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          No premier destinations yet. Add your first destination.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paged.map(d => (
            <div key={d.id} className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition group ${!d.active ? 'opacity-60' : 'border-gray-200'}`}>
              <div className="relative h-32 bg-gray-100">
                {d.image_url
                  ? <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin size={32} /></div>
                }
                <div className="absolute top-2 left-2">
                  <span className="bg-[#101c34] text-white text-xs px-2 py-0.5 rounded-full">{d.region}</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => toggleActive(d)} className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:bg-gray-50" title={d.active ? 'Hide' : 'Show'}>
                    {d.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button onClick={() => openEdit(d)} className="p-1.5 bg-white rounded-lg shadow text-blue-600 hover:bg-blue-50"><Edit size={13} /></button>
                  <button onClick={() => handleDelete(d.id, d.title)} className="p-1.5 bg-white rounded-lg shadow text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-[#101c34] text-sm">{d.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{d.city || d.region}</p>
                {!d.active && <span className="text-xs text-orange-500 font-medium">Hidden</span>}
              </div>
            </div>
          ))}
        </div>
      )}

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
              <h2 className="text-lg font-bold text-[#101c34]">{isEdit ? 'Edit Destination' : 'Add Destination'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {localImagePreview || form.image_url
                      ? <img src={localImagePreview || form.image_url} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-xs text-gray-400">No image</span>
                    }
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">Upload Image</button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                </div>
                <input value={form.image_url} onChange={e => set('image_url', e.target.value)} className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Or paste image URL..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Premier Destination of Delhi" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                  <select value={form.region} onChange={e => set('region', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. New Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => set('active', form.active ? 0 : 1)} className={`w-11 h-6 rounded-full relative transition-colors ${form.active ? 'bg-[#101c34]' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Visible</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" placeholder="Brief description of this destination..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#101c34] text-white text-sm font-medium hover:bg-[#1a2d52] disabled:opacity-60 transition">
                <Save size={15} />{saving ? 'Saving...' : (isEdit ? 'Update' : 'Add Destination')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
