import { useEffect, useState, useCallback } from 'react';
import { Search, Trash2, Eye, X, ChevronLeft, ChevronRight, RefreshCw, Mail, CheckCircle } from 'lucide-react';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  address?: string;
  number_of_guests?: string;
  attending?: string;
  meal_preferences?: string;
  message?: string;
  is_read: number;
  created_at?: string;
}

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [error, setError] = useState('');

  const fetchInquiries = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(API('inquiries.php'));
      const data = await res.json();
      setInquiries(Array.isArray(data.data) ? data.data : []);
    } catch { setError('Failed to load inquiries.'); setInquiries([]); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const filtered = inquiries.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q);
    const matchRead = filterRead === '' ? true : filterRead === 'unread' ? !i.is_read : !!i.is_read;
    return matchSearch && matchRead;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const unreadCount = inquiries.filter(i => !i.is_read).length;

  const markRead = async (id: number) => {
    await fetch(API('inquiries.php'), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setInquiries(inqs => inqs.map(i => i.id === id ? { ...i, is_read: 1 } : i));
  };

  const openDetail = async (inquiry: Inquiry) => {
    setSelected(inquiry);
    if (!inquiry.is_read) await markRead(inquiry.id);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete inquiry from "${name}"?`)) return;
    const res = await fetch(API('inquiries.php'), { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const data = await res.json();
    if (data.success) { setInquiries(i => i.filter(x => x.id !== id)); if (selected?.id === id) setSelected(null); }
    else alert(data.error || 'Delete failed');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        {unreadCount > 0 && (
          <span className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Mail size={14} /> {unreadCount} unread
          </span>
        )}
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search inquiries..." className="text-sm outline-none w-full" />
        </div>
        <select value={filterRead} onChange={e => { setFilterRead(e.target.value); setPage(1); }} className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none">
          <option value="">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <button onClick={fetchInquiries} className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition">
          <RefreshCw size={14} /> Refresh
        </button>
        <span className="text-sm text-gray-500 ml-auto">{filtered.length} inquiries</span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-2"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Guests</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attending</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Meal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}>{[...Array(8)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /></td>)}</tr>)
              ) : paged.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No inquiries found.</td></tr>
              ) : paged.map(i => (
                <tr key={i.id} className={`hover:bg-gray-50 transition ${!i.is_read ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    {!i.is_read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#101c34]">{i.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{i.email}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{i.number_of_guests || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs capitalize">{i.attending || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs capitalize">{i.meal_preferences || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{i.created_at ? new Date(i.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openDetail(i)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition"><Eye size={15} /></button>
                      {!i.is_read && <button onClick={() => markRead(i.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition" title="Mark as read"><CheckCircle size={15} /></button>}
                      <button onClick={() => handleDelete(i.id, i.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 size={15} /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#101c34]">Inquiry Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                ['Name', selected.name],
                ['Email', selected.email],
                ['Address', selected.address],
                ['Number of Guests', selected.number_of_guests],
                ['Attending', selected.attending],
                ['Meal Preferences', selected.meal_preferences],
                ['Message', selected.message],
                ['Submitted On', selected.created_at ? new Date(selected.created_at).toLocaleString() : null],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} className="flex gap-3">
                  <span className="text-gray-500 w-36 flex-shrink-0 font-medium">{label}</span>
                  <span className="text-gray-800 break-all capitalize">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button onClick={() => handleDelete(selected.id, selected.name).then(() => setSelected(null))} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition">
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
