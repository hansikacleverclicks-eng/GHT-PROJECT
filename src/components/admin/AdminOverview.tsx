import { useEffect, useState } from 'react';
import { Hotel, MapPin, Users, Newspaper, Building2, Star, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  hotels: number;
  cities: number;
  vendors: number;
  blogs: number;
  featuredVendors: number;
  registrations: number;
}

type Section = 'hotels' | 'cities' | 'vendors' | 'event-planners' | 'blogs' | 'registrations' | 'awards' | 'premier-destinations' | 'inquiries';

interface Props {
  onNavigate: (section: Section) => void;
}

const API = (path: string) =>
  import.meta.env.MODE === 'development'
    ? `https://globalhotelsandtourism.com/backend/api/${path}`
    : `/backend/api/${path}`;

export default function AdminOverview({ onNavigate }: Props) {
  const [stats, setStats] = useState<Stats>({ hotels: 0, cities: 0, vendors: 0, blogs: 0, featuredVendors: 0, registrations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hotelsRes, citiesRes, vendorsRes, blogsRes, regsRes] = await Promise.all([
          fetch(API('get_hotels.php')),
          fetch(API('get_cities.php')),
          fetch(API('get_vendors.php')),
          fetch(API('current_affairs.php')),
          fetch(API('get_registrations.php')).catch(() => null),
        ]);

        const hotels = await hotelsRes.json().catch(() => []);
        const cities = await citiesRes.json().catch(() => []);
        const vendors = await vendorsRes.json().catch(() => []);
        const blogsData = await blogsRes.json().catch(() => ({ data: [] }));
        const regsData = regsRes ? await regsRes.json().catch(() => ({ data: [] })) : { data: [] };

        const vendorArr = Array.isArray(vendors) ? vendors : [];
        setStats({
          hotels: Array.isArray(hotels) ? hotels.length : 0,
          cities: Array.isArray(cities) ? cities.length : 0,
          vendors: vendorArr.length,
          blogs: Array.isArray(blogsData.data) ? blogsData.data.length : 0,
          featuredVendors: vendorArr.filter((v: any) => v.featured).length,
          registrations: Array.isArray(regsData.data) ? regsData.data.length : 0,
        });
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Hotels', value: stats.hotels, icon: <Hotel size={22} />, color: 'bg-blue-50 text-blue-600', section: 'hotels' as Section },
    { label: 'Cities', value: stats.cities, icon: <MapPin size={22} />, color: 'bg-green-50 text-green-600', section: 'cities' as Section },
    { label: 'Vendors', value: stats.vendors, icon: <Users size={22} />, color: 'bg-purple-50 text-purple-600', section: 'vendors' as Section },
    { label: 'Blogs / Articles', value: stats.blogs, icon: <Newspaper size={22} />, color: 'bg-orange-50 text-orange-600', section: 'blogs' as Section },
    { label: 'Featured Vendors', value: stats.featuredVendors, icon: <Star size={22} />, color: 'bg-yellow-50 text-yellow-600', section: 'vendors' as Section },
    { label: 'Registrations', value: stats.registrations, icon: <Building2 size={22} />, color: 'bg-red-50 text-red-600', section: 'registrations' as Section },
  ];

  const quickActions = [
    { label: 'Add Hotel', section: 'hotels' as Section, icon: <Hotel size={16} />, color: 'bg-[#101c34] text-white hover:bg-[#1a2d52]' },
    { label: 'Add City', section: 'cities' as Section, icon: <MapPin size={16} />, color: 'bg-[#101c34] text-white hover:bg-[#1a2d52]' },
    { label: 'Add Vendor', section: 'vendors' as Section, icon: <Users size={16} />, color: 'bg-[#101c34] text-white hover:bg-[#1a2d52]' },
    { label: 'Add Blog', section: 'blogs' as Section, icon: <Newspaper size={16} />, color: 'bg-[#101c34] text-white hover:bg-[#1a2d52]' },
    { label: 'Event Planners', section: 'event-planners' as Section, icon: <Calendar size={16} />, color: 'bg-[#101c34] text-white hover:bg-[#1a2d52]' },
    { label: 'Registrations', section: 'registrations' as Section, icon: <TrendingUp size={16} />, color: 'bg-[#101c34] text-white hover:bg-[#1a2d52]' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-[#101c34] rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Welcome to GH&T Admin</h2>
        <p className="text-[#8a9bbf] text-sm">Manage all your hotels, vendors, cities, blogs and more from here.</p>
      </div>

      {/* Stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statCards.map(card => (
            <button
              key={card.label}
              onClick={() => onNavigate(card.section)}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#101c34] transition-all group"
            >
              <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
                {card.icon}
              </div>
              <div className="text-2xl font-bold text-[#101c34]">
                {loading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : card.value}
              </div>
              <div className="text-sm text-gray-500 mt-0.5 group-hover:text-[#101c34] transition">{card.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => onNavigate(action.section)}
              className={`flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-xs font-medium transition ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
