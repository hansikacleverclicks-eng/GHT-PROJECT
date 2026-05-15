import { useEffect, useState, useRef, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, ChevronLeft, ChevronRight, Filter, Star, Upload } from 'lucide-react';
import BulkUpload from './BulkUpload';

interface Vendor {
  id: number;
  vendorName: string;
  email: string;
  phone?: string;
  contactPersonName?: string;
  category?: string;
  city?: string;
  websiteUrl?: string;
  imageUrl?: string;
  description?: string;
  featured?: boolean;
  aboutDescription?: string;
  outdoorPrice?: number;
  indoorPrice?: number;
  serviceAreas?: string;
  occasions?: string[];
  galleryImages?: string[];
  socialMedia?: { instagram?: string; facebook?: string; linkedin?: string; youtube?: string };
  contactAddress?: string;
  yearsExperience?: number;
  teamSize?: string;
  specialties?: string;
  status?: string;
}

const CATEGORIES = ['Event Planners', 'Caterer', 'Decorator', 'Photography', 'Venue', 'Entertainment', 'Travel & Tours', 'Other'];

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

const emptyVendor = (): Vendor => ({
  id: 0, vendorName: '', email: '', phone: '', contactPersonName: '',
  category: '', city: '', websiteUrl: '', imageUrl: '', description: '',
  featured: false, aboutDescription: '', outdoorPrice: 0, indoorPrice: 0,
  serviceAreas: '', occasions: [], galleryImages: [], socialMedia: {},
  contactAddress: '', yearsExperience: 0, teamSize: '', specialties: '', status: 'active'
});

export default function VendorsManager({ categoryFilter }: { categoryFilter?: string }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState(categoryFilter || '');
  const [filterCity, setFilterCity] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [bulkOpen, setBulkOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Vendor>(emptyVendor());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'featured' | 'social'>('basic');
  const fileRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    const res = await fetch(API('get_vendors.php'));
    const data = await res.json();
    const arr = Array.isArray(data) ? data : [];
    setVendors(arr.map((v: any) => ({
      ...v,
      occasions: typeof v.occasions === 'string' ? JSON.parse(v.occasions || '[]') : (v.occasions || []),
      galleryImages: typeof v.galleryImages === 'string' ? JSON.parse(v.galleryImages || '[]') : (v.galleryImages || []),
      socialMedia: typeof v.socialMedia === 'string' ? JSON.parse(v.socialMedia || '{}') : (v.socialMedia || {}),
    })));
    const uniqueCities = [...new Set(arr.map((v: any) => v.city).filter(Boolean))].sort() as string[];
    setCities(uniqueCities);
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, []);

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.vendorName.toLowerCase().includes(q) || (v.email || '').toLowerCase().includes(q) || (v.city || '').toLowerCase().includes(q);
    const matchCat = !filterCategory || (v.category || '').toLowerCase().includes(filterCategory.toLowerCase());
    const matchCity = !filterCity || v.city === filterCity;
    return matchSearch && matchCat && matchCity;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm(emptyVendor());
    setIsEdit(false);
    setFormError('');
    setActiveTab('basic');
    setLocalPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };

  const openEdit = async (id: number) => {
    const res = await fetch(API(`get_vendor.php?id=${id}`));
    const data = await res.json();
    if (data && data.id) {
      setForm({
        ...emptyVendor(),
        ...data,
        occasions: typeof data.occasions === 'string' ? JSON.parse(data.occasions || '[]') : (data.occasions || []),
        galleryImages: typeof data.galleryImages === 'string' ? JSON.parse(data.galleryImages || '[]') : (data.galleryImages || []),
        socialMedia: typeof data.socialMedia === 'string' ? JSON.parse(data.socialMedia || '{}') : (data.socialMedia || {}),
      });
      setIsEdit(true);
      setFormError('');
      setActiveTab('basic');
      setLocalPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      setModalOpen(true);
    }
  };

  const closeModal = () => { setModalOpen(false); setFormError(''); setLocalPreview(null); };

  const set = (field: keyof Vendor, value: any) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.vendorName.trim()) { setFormError('Vendor name is required.'); return; }
    if (!form.email.trim()) { setFormError('Email is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const url = isEdit ? API('update_vendor.php') : API('add_vendor.php');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      const data = JSON.parse(text);
      if (!data.success) throw new Error(data.error || 'Save failed');

      // Handle logo upload separately if file chosen
      if (fileRef.current?.files?.[0] && (data.id || form.id)) {
        const vendorId = data.id || form.id;
        const fd = new FormData();
        fd.append('image', fileRef.current.files[0]);
        fd.append('vendorId', String(vendorId));
        await fetch(API('upload_vendor_logo.php'), { method: 'POST', body: fd });
      }

      await fetchVendors();
      closeModal();
    } catch (e: any) {
      setFormError(e.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (email: string, name: string) => {
    if (!confirm(`Delete vendor "${name}"?`)) return;
    const res = await fetch(API('delete_vendor.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) setVendors(v => v.filter(x => x.email !== email));
    else alert(data.error || 'Delete failed');
  };

  const addToArray = (field: 'occasions' | 'galleryImages') => {
    setForm(f => ({ ...f, [field]: [...(f[field] as string[]), ''] }));
  };
  const updateArray = (field: 'occasions' | 'galleryImages', idx: number, val: string) => {
    setForm(f => {
      const arr = [...(f[field] as string[])];
      arr[idx] = val;
      return { ...f, [field]: arr };
    });
  };
  const removeFromArray = (field: 'occasions' | 'galleryImages', idx: number) => {
    setForm(f => ({ ...f, [field]: (f[field] as string[]).filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-4">
      {/* Bulk Upload Panel */}
      {bulkOpen && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#101c34]">Bulk Upload Vendors</h3>
            <button onClick={() => setBulkOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><X size={16} /></button>
          </div>
          <BulkUpload type="vendors" onDone={() => { setBulkOpen(false); fetchVendors(); }} />
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition">
          <Plus size={16} /> Add Vendor
        </button>
        {!categoryFilter && (
          <button onClick={() => setBulkOpen(v => !v)} className="flex items-center gap-2 border border-[#101c34] text-[#101c34] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#101c34] hover:text-white transition">
            <Upload size={15} /> Bulk Upload
          </button>
        )}
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search vendors..." className="text-sm outline-none w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          {!categoryFilter && (
            <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          <select value={filterCity} onChange={e => { setFilterCity(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} vendors</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Logo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Featured</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No vendors found.</td></tr>
              ) : paged.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {v.imageUrl
                      ? <img src={v.imageUrl} alt={v.vendorName} className="w-10 h-10 object-contain rounded-lg border bg-white" />
                      : <div className="w-10 h-10 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-sm">{v.vendorName?.[0]?.toUpperCase()}</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-[#101c34]">{v.vendorName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-[#e8ebf3] text-[#101c34] text-xs px-2 py-1 rounded-full">{v.category || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.city || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{v.email}</td>
                  <td className="px-4 py-3">
                    {v.featured
                      ? <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium"><Star size={12} fill="currentColor" /> Featured</span>
                      : <span className="text-gray-400 text-xs">Regular</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(v.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(v.email, v.vendorName)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
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
              <h2 className="text-lg font-bold text-[#101c34]">{isEdit ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              {(['basic', 'featured', 'social'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`py-3 px-4 text-sm font-medium capitalize border-b-2 -mb-px transition ${activeTab === t ? 'border-[#101c34] text-[#101c34]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t === 'featured' ? 'Featured Details' : t === 'social' ? 'Social Media' : 'Basic Info'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

              {activeTab === 'basic' && (
                <>
                  {/* Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {localPreview
                          ? <img src={localPreview} alt="preview" className="w-full h-full object-contain" />
                          : form.imageUrl
                            ? <img src={form.imageUrl} alt="logo" className="w-full h-full object-contain" />
                            : <span className="text-xs text-gray-400">No logo</span>
                        }
                      </div>
                      <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
                          <Upload size={14} /> Upload Logo
                        </button>
                        {localPreview && <span className="text-xs text-green-600">New image selected</span>}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) setLocalPreview(URL.createObjectURL(file));
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                      <input value={form.vendorName} onChange={e => set('vendorName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Business name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input value={form.email} onChange={e => set('email', e.target.value)} disabled={isEdit} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] disabled:bg-gray-50" placeholder="contact@vendor.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input value={form.contactPersonName || ''} onChange={e => set('contactPersonName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                        <option value="">Select Category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input value={form.city || ''} onChange={e => set('city', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Delhi" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                      <input value={form.websiteUrl || ''} onChange={e => set('websiteUrl', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="https://..." />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" placeholder="Brief vendor description..." />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('featured', !form.featured)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${form.featured ? 'bg-[#101c34]' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.featured ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Mark as Featured Vendor</span>
                  </label>
                </>
              )}

              {activeTab === 'featured' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">These fields appear on the vendor's public profile page when marked as Featured.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About Description</label>
                    <textarea value={form.aboutDescription || ''} onChange={e => set('aboutDescription', e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Outdoor Price (₹)</label>
                      <input type="number" value={form.outdoorPrice || ''} onChange={e => set('outdoorPrice', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Indoor Price (₹)</label>
                      <input type="number" value={form.indoorPrice || ''} onChange={e => set('indoorPrice', parseFloat(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input type="number" value={form.yearsExperience || ''} onChange={e => set('yearsExperience', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
                      <input value={form.teamSize || ''} onChange={e => set('teamSize', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. 10-20 members" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Areas</label>
                    <input value={form.serviceAreas || ''} onChange={e => set('serviceAreas', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Delhi, Gurgaon, Noida" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Address</label>
                    <textarea value={form.contactAddress || ''} onChange={e => set('contactAddress', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                    <textarea value={form.specialties || ''} onChange={e => set('specialties', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occasions</label>
                    {(form.occasions || []).map((o, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={o} onChange={e => updateArray('occasions', i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Wedding" />
                        <button type="button" onClick={() => removeFromArray('occasions', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={14} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addToArray('occasions')} className="text-sm text-[#101c34] hover:underline">+ Add Occasion</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gallery Images (URLs)</label>
                    {(form.galleryImages || []).map((g, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={g} onChange={e => updateArray('galleryImages', i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="https://..." />
                        <button type="button" onClick={() => removeFromArray('galleryImages', i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={14} /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addToArray('galleryImages')} className="text-sm text-[#101c34] hover:underline">+ Add Image URL</button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-4">
                  {(['instagram', 'facebook', 'linkedin', 'youtube'] as const).map(platform => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform}</label>
                      <input value={form.socialMedia?.[platform] || ''} onChange={e => setForm(f => ({ ...f, socialMedia: { ...f.socialMedia, [platform]: e.target.value } }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder={`${platform} profile URL`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#101c34] text-white text-sm font-medium hover:bg-[#1a2d52] disabled:opacity-60 transition">
                <Save size={15} />
                {saving ? 'Saving...' : (isEdit ? 'Update Vendor' : 'Add Vendor')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
