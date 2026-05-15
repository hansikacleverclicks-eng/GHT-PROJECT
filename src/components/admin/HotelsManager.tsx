import { useEffect, useState, useRef } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, ChevronLeft, ChevronRight, Filter, Upload } from 'lucide-react';
import BulkUpload from './BulkUpload';

interface Hotel {
  id: number;
  hotel_name: string;
  city: string;
  state: string;
  country: string;
  parent_company: string;
  sub_brand: string;
  description: string;
  website_url: string;
  hero_image_url: string;
}

interface City { id: number; name: string; }

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

const emptyHotel = (): Omit<Hotel, 'id'> => ({
  hotel_name: '', city: '', state: '', country: 'India',
  parent_company: '', sub_brand: '', description: '', website_url: '', hero_image_url: ''
});

export default function HotelsManager() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [bulkOpen, setBulkOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Hotel>({ id: 0, ...emptyHotel() });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [localImageFile, setLocalImageFile] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchHotels = async () => {
    setLoading(true);
    const res = await fetch(API('get_hotels.php'));
    const data = await res.json();
    setHotels(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
    fetch(API('get_cities.php'))
      .then(r => r.json())
      .then(d => setCities(Array.isArray(d) ? d : []));
  }, []);

  // Derived filters
  const companies = [...new Set(hotels.map(h => h.parent_company).filter(Boolean))].sort();

  const filtered = hotels.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.hotel_name?.toLowerCase().includes(q) || h.city?.toLowerCase().includes(q) || h.parent_company?.toLowerCase().includes(q);
    const matchCity = !filterCity || h.city === filterCity;
    const matchCompany = !filterCompany || h.parent_company === filterCompany;
    return matchSearch && matchCity && matchCompany;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setForm({ id: 0, ...emptyHotel() });
    setIsEdit(false);
    setFormError('');
    setLocalImageFile(null);
    setLocalImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (h: Hotel) => {
    setForm({ ...h });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
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
    if (!form.hotel_name.trim()) { setFormError('Hotel name is required.'); return; }
    if (!form.city.trim()) { setFormError('City is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      let hero_image_url = form.hero_image_url;
      let hotelId = form.id;

      if (isEdit) {
        // Edit: upload image first (we already have the ID), then update
        if (localImageFile) {
          const fd = new FormData();
          fd.append('image', localImageFile);
          fd.append('hotelId', String(hotelId));
          const upRes = await fetch(API('upload_hotel_image.php'), { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (upData.success && upData.hero_image_url) {
            hero_image_url = upData.hero_image_url;
          } else {
            setFormError(upData.error || 'Image upload failed.');
            setSaving(false);
            return;
          }
        }
        const res = await fetch(API('update_hotel.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, hero_image_url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Update failed');
      } else {
        // Add: save hotel first to get ID, then upload image
        const res = await fetch(API('add_hotel.php'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, hero_image_url }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Add failed');
        hotelId = data.id;

        // Now upload image if selected, using the new hotel ID
        if (localImageFile && hotelId) {
          const fd = new FormData();
          fd.append('image', localImageFile);
          fd.append('hotelId', String(hotelId));
          const upRes = await fetch(API('upload_hotel_image.php'), { method: 'POST', body: fd });
          const upData = await upRes.json();
          if (!upData.success) {
            // Hotel was saved but image failed — show warning not error
            setFormError('Hotel saved, but image upload failed: ' + (upData.error || 'Unknown error'));
          }
        }
      }

      await fetchHotels();
      closeModal();
    } catch (e: any) {
      setFormError(e.message || 'Save failed');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(API('delete_hotel.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) setHotels(h => h.filter(x => x.id !== id));
    else alert(data.error || 'Delete failed');
  };

  const cityOptions = cities.length
    ? cities.map(c => c.name)
    : [...new Set(hotels.map(h => h.city).filter(Boolean))].sort();

  return (
    <div className="space-y-4">
      {/* Bulk Upload Panel */}
      {bulkOpen && (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#101c34]">Bulk Upload Hotels</h3>
            <button onClick={() => setBulkOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"><X size={16} /></button>
          </div>
          <BulkUpload type="hotels" onDone={() => { setBulkOpen(false); fetchHotels(); }} />
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#101c34] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2d52] transition">
          <Plus size={16} /> Add Hotel
        </button>
        <button onClick={() => setBulkOpen(v => !v)} className="flex items-center gap-2 border border-[#101c34] text-[#101c34] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#101c34] hover:text-white transition">
          <Upload size={15} /> Bulk Upload
        </button>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search hotels..."
            className="text-sm outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select
            value={filterCity}
            onChange={e => { setFilterCity(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none"
          >
            <option value="">All Cities</option>
            {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterCompany}
            onChange={e => { setFilterCompany(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none"
          >
            <option value="">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} hotels</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Hotel Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sub-brand</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No hotels found.</td></tr>
              ) : paged.map(h => (
                <tr key={h.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {h.hero_image_url
                      ? <img src={h.hero_image_url} alt={h.hotel_name} className="w-14 h-10 object-cover rounded-lg border" />
                      : <div className="w-14 h-10 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-300 text-xs">No img</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-[#101c34]">{h.hotel_name}</td>
                  <td className="px-4 py-3 text-gray-600">{h.city}</td>
                  <td className="px-4 py-3 text-gray-600">{h.state}</td>
                  <td className="px-4 py-3 text-gray-600">{h.country}</td>
                  <td className="px-4 py-3 text-gray-600">{h.parent_company}</td>
                  <td className="px-4 py-3 text-gray-600">{h.sub_brand}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(h)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(h.id, h.hotel_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={15} />
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#101c34]">{isEdit ? 'Edit Hotel' : 'Add Hotel'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>}

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-28 h-20 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                    {localImagePreview || form.hero_image_url
                      ? <img src={localImagePreview || form.hero_image_url} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-xs text-gray-400">No image</span>
                    }
                  </div>
                  <div>
                    <button type="button" onClick={() => fileRef.current?.click()} className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition">
                      {form.hero_image_url || localImagePreview ? 'Change Image' : 'Upload Image'}
                    </button>
                    {form.hero_image_url && !localImagePreview && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, hero_image_url: '' }))} className="ml-2 text-sm text-red-500 hover:underline">Remove</button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                  <input name="hotel_name" value={form.hotel_name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. The Grand Oberoi" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <select name="city" value={form.city} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]">
                    <option value="">Select City</option>
                    {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__other">Other (type below)</option>
                  </select>
                  {form.city === '__other' && (
                    <input name="city" onChange={handleChange} className="w-full mt-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="Enter city name" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input name="state" value={form.state} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Delhi" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. India" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Company</label>
                  <input name="parent_company" value={form.parent_company} onChange={handleChange} list="companies-list" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Oberoi Group" />
                  <datalist id="companies-list">
                    {companies.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-brand</label>
                  <input name="sub_brand" value={form.sub_brand} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="e.g. Trident Hotels" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input name="website_url" value={form.website_url} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34]" placeholder="https://..." />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#101c34] resize-none" placeholder="Brief description of the hotel..." />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#101c34] text-white text-sm font-medium hover:bg-[#1a2d52] disabled:opacity-60 transition">
                <Save size={15} />
                {saving ? 'Saving...' : (isEdit ? 'Update Hotel' : 'Add Hotel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
