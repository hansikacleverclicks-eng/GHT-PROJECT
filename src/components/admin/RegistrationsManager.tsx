import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Eye, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface Registration {
  id: number;
  business_name: string;
  category: string;
  city: string;
  contact_person_name: string;
  email: string;
  phone: string;
  address?: string;
  description?: string;
  established_year?: string;
  capacity?: string;
  price_range_min?: string;
  price_range_max?: string;
  amenities?: string;
  website?: string;
  social_media?: string;
  specializations?: string;
  created_at?: string;
}

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

export default function RegistrationsManager() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selected, setSelected] = useState<Registration | null>(null);
  const [error, setError] = useState('');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API('get_registrations.php'));
      const data = await res.json();
      setRegistrations(Array.isArray(data.data) ? data.data : []);
    } catch {
      setError('Failed to load registrations.');
      setRegistrations([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  const filtered = registrations.filter(r => {
    const q = search.toLowerCase();
    return !q || r.business_name?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.city?.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete registration from "${name}"?`)) return;
    const res = await fetch(API('delete_registration.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) setRegistrations(r => r.filter(x => x.id !== id));
    else alert(data.error || 'Delete failed');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search registrations..." className="text-sm outline-none w-full" />
        </div>
        <button onClick={fetchRegistrations} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={14} /> Refresh
        </button>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} registrations</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Business Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">City</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact Person</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
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
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No registrations found.</td></tr>
              ) : paged.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-[#101c34]">{r.business_name}</td>
                  <td className="px-4 py-3"><span className="bg-[#e8ebf3] text-[#101c34] text-xs px-2 py-1 rounded-full">{r.category}</span></td>
                  <td className="px-4 py-3 text-gray-600">{r.city}</td>
                  <td className="px-4 py-3 text-gray-600">{r.contact_person_name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.phone}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Eye size={15} /></button>
                      <button onClick={() => handleDelete(r.id, r.business_name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
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

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#101c34]">Registration Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ['Business Name', selected.business_name],
                ['Category', selected.category],
                ['City', selected.city],
                ['Contact Person', selected.contact_person_name],
                ['Email', selected.email],
                ['Phone', selected.phone],
                ['Address', selected.address],
                ['Website', selected.website],
                ['Description', selected.description],
                ['Established Year', selected.established_year],
                ['Capacity', selected.capacity],
                ['Price Range', selected.price_range_min && selected.price_range_max ? `₹${selected.price_range_min} – ₹${selected.price_range_max}` : null],
                ['Amenities', selected.amenities],
                ['Specializations', selected.specializations],
                ['Social Media', selected.social_media],
                ['Submitted On', selected.created_at ? new Date(selected.created_at).toLocaleString() : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex gap-3">
                  <span className="text-gray-500 w-36 flex-shrink-0 font-medium">{label}</span>
                  <span className="text-gray-800 break-all">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => handleDelete(selected.id, selected.business_name).then(() => setSelected(null))} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition">
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-lg bg-[#101c34] text-white text-sm hover:bg-[#1a2d52] transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
