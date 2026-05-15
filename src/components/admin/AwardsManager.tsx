import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, X, Save, Search, ChevronLeft, ChevronRight, Trophy, Upload } from 'lucide-react';

interface Award {
  id: number;
  nominee_name: string;
  nominee_type: 'hotel' | 'vendor' | 'other';
  category: string;
  tier: 'Pinnacle' | 'Excellence' | 'Distinction';
  city: string;
  year: number;
  description: string;
  image_url: string;
  status: 'nominated' | 'winner' | 'finalist';
}

const TIERS = ['Pinnacle', 'Excellence', 'Distinction'] as const;
const STATUSES = ['nominated', 'finalist', 'winner'] as const;
const TIER_COLORS: Record<string, string> = {
  Pinnacle: 'bg-[#101c34] text-white',
  Excellence: 'bg-blue-500 text-white',
  Distinction: 'bg-green-500 text-white',
};
const STATUS_COLORS: Record<string, string> = {
  nominated: 'bg-gray-100 text-gray-700',
  finalist: 'bg-yellow-100 text-yellow-700',
  winner: 'bg-green-100 text-green-700',
};

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

const empty = (): Omit<Award, 'id'> => ({
  nominee_name: '', nominee_type: 'hotel', category: '', tier: 'Excellence',
  city: '', year: new Date().getFullYear(), description: '', image_url: '', status: 'nominated'
});

export default function AwardsManager() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Award>({ id: 0, ...empty() });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const fetchAwards = useCallback(async () => {
    setLoading(true);
    const res = await fetch(API('awards.php'));
    const data = await res.json();
    setAwards(Array.isArray(data.data) ? data.data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAwards(); }, [fetchAwards]);

  const filtered = awards.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.nominee_name.toLowerCase().includes(q) || a.city?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q);
    const matchTier = !filterTier || a.tier === filterTier;
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchTier && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm({ id: 0, ...empty() }); setIsEdit(false); setFormError('');
    setLocalPreview(null); setLocalFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };
  const openEdit = (a: Award) => {
    setForm({ ...a }); setIsEdit(true); setFormError('');
    setLocalPreview(null); setLocalFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setFormError(''); setLocalPreview(null); setLocalFile(null); };
  const set = (field: keyof Award, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.nominee_name.trim()) { setFormError('Nominee name is required.'); return; }
    if (!form.tier) { setFormError('Tier is required.'); return; }
    setSaving(true); setFormError('');
    try {
      let image_url = form.image_url || '';

      if (isEdit) {
        if (localFile && form.id) {
          const fd = new FormData();
          fd.append('image', localFile);
          fd.append('awardId', String(form.id));
          const upRes = await fetch(API('upload_award_image.php'), { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (upData.success && upData.image_url) image_url = upData.image_url;
          else { setFormError(upData.error || 'Image upload failed.'); setSaving(false); return; }
        }
        const res = await fetch(API('awards.php'), {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, image_url })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Update failed');
      } else {
        const res = await fetch(API('awards.php'), {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, image_url })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Save failed');
        const newId = data.id;
        if (localFile && newId) {
          const fd = new FormData();
          fd.append('image', localFile);
          fd.append('awardId', String(newId));
          const upRes = await fetch(API('upload_award_image.php'), { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (!upData.success) setFormError('Award saved, but image upload failed: ' + (upData.error || 'Unknown error'));
        }
      }

      await fetchAwards(); closeModal();
    } catch (e: any) { setFormError(e.message || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete award for "${name}"?`)) return;
    const res = await fetch(API('awards.php'), { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) setAwards(a => a.filter(x => x.id !== id));
    else alert(data.error || 'Delete failed');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition">
          <Plus size={16} /> Add Nominee
        </button>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search nominees..." className="text-sm outline-none w-full" />
        </div>
        <select value={filterTier} onChange={e => { setFilterTier(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
          <option value="">All Tiers</option>
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} nominees</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nominee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(4)].map((_, i) => <tr key={i}>{[...Array(8)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>)}</tr>)
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No nominees found. Add your first award nominee.</td></tr>
              ) : paged.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-[#101c34]">{a.nominee_name}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{a.nominee_type}</td>
                  <td className="px-4 py-3 text-gray-600">{a.category}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${TIER_COLORS[a.tier]}`}>{a.tier}</span></td>
                  <td className="px-4 py-3 text-gray-600">{a.city}</td>
                  <td className="px-4 py-3 text-gray-600">{a.year}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(a.id, a.nominee_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#101c34] flex items-center gap-2"><Trophy size={18} />{isEdit ? 'Edit Nominee' : 'Add Nominee'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominee Name *</label>
                <input value={form.nominee_name} onChange={e => set('nominee_name', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Hotel or vendor name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.nominee_type} onChange={e => set('nominee_type', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    <option value="hotel">Hotel</option>
                    <option value="vendor">Vendor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tier *</label>
                  <select value={form.tier} onChange={e => set('tier', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input type="number" value={form.year} onChange={e => set('year', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Best Luxury Hotel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Delhi" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-20 h-16 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                    {localPreview
                      ? <img src={localPreview} alt="preview" className="w-full h-full object-cover" />
                      : form.image_url
                        ? <img src={form.image_url} alt="award" className="w-full h-full object-cover" />
                        : <span className="text-xs text-gray-400">No image</span>
                    }
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                      <Upload size={14} /> Upload Image
                    </button>
                    {localPreview && <span className="text-xs text-green-600">New image selected</span>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) { setLocalFile(file); setLocalPreview(URL.createObjectURL(file)); }
                    }}
                  />
                </div>
                <input value={form.image_url} onChange={e => { set('image_url', e.target.value); setLocalPreview(null); setLocalFile(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Or paste image URL here" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" placeholder="Why this nominee deserves the award..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#101c34] text-white text-sm font-medium hover:bg-[#1a2d52] disabled:opacity-60 transition">
                <Save size={15} />{saving ? 'Saving...' : (isEdit ? 'Update' : 'Add Nominee')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
