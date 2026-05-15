import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logoremove.png';
import {
  LayoutDashboard, Hotel, MapPin, Users, Calendar, Newspaper,
  LogOut, Menu, X, ChevronRight, Building2, Star, Trophy, Globe, Mail
} from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import HotelsManager from '@/components/admin/HotelsManager';
import CitiesManager from '@/components/admin/CitiesManager';
import VendorsManager from '@/components/admin/VendorsManager';
import EventPlannersManager from '@/components/admin/EventPlannersManager';
import BlogsManager from '@/components/admin/BlogsManager';
import RegistrationsManager from '@/components/admin/RegistrationsManager';
import AwardsManager from '@/components/admin/AwardsManager';
import PremierDestinationsManager from '@/components/admin/PremierDestinationsManager';
import InquiriesManager from '@/components/admin/InquiriesManager';

type Section =
  | 'overview'
  | 'hotels'
  | 'cities'
  | 'vendors'
  | 'event-planners'
  | 'blogs'
  | 'awards'
  | 'premier-destinations'
  | 'registrations'
  | 'inquiries';

const navItems: { key: Section; label: string; icon: React.ReactNode; group?: string }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { key: 'hotels', label: 'Hotels', icon: <Hotel size={18} />, group: 'Content' },
  { key: 'cities', label: 'Cities', icon: <MapPin size={18} />, group: 'Content' },
  { key: 'vendors', label: 'Vendors', icon: <Users size={18} />, group: 'Content' },
  { key: 'event-planners', label: 'Event Planners', icon: <Calendar size={18} />, group: 'Content' },
  { key: 'blogs', label: 'Blogs / Current Affairs', icon: <Newspaper size={18} />, group: 'Content' },
  { key: 'awards', label: 'Awards', icon: <Trophy size={18} />, group: 'Content' },
  { key: 'premier-destinations', label: 'Premier Destinations', icon: <Globe size={18} />, group: 'Content' },
  { key: 'registrations', label: 'Registrations', icon: <Building2 size={18} />, group: 'Requests' },
  { key: 'inquiries', label: 'Inquiries', icon: <Mail size={18} />, group: 'Requests' },
];

const sectionTitles: Record<Section, string> = {
  overview: 'Overview',
  hotels: 'Hotels',
  cities: 'Cities',
  vendors: 'Vendors',
  'event-planners': 'Event Planners',
  blogs: 'Blogs / Current Affairs',
  awards: 'Awards',
  'premier-destinations': 'Premier Destinations',
  registrations: 'Vendor Registrations',
  inquiries: 'Global Inquiries',
};

const AdminDashboard = () => {
  const { email, role, refresh } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await fetch('/backend/api/auth/logout.php');
    await refresh();
    navigate('/admin');
  };

  const handleNav = (key: Section) => {
    setActiveSection(key);
    setSidebarOpen(false);
  };

  const groups = ['', 'Content', 'Requests'];

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#101c34] z-30 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e3060]">
          <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
            <img src={logo} alt="GH&T" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">GH&T Admin</p>
            <p className="text-[#8a9bbf] text-xs">Global Hotels & Tourism</p>
          </div>
          <button className="ml-auto text-[#8a9bbf] lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {groups.map(group => {
            const items = navItems.filter(i => (i.group ?? '') === group);
            if (!items.length) return null;
            return (
              <div key={group} className="mb-4">
                {group && (
                  <p className="text-[#4a6080] text-xs font-semibold uppercase tracking-wider px-3 mb-2">{group}</p>
                )}
                {items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-all
                      ${activeSection === item.key
                        ? 'bg-white text-[#101c34]'
                        : 'text-[#8a9bbf] hover:bg-[#1e3060] hover:text-white'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                    {activeSection === item.key && <ChevronRight size={14} className="ml-auto" />}
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-[#1e3060] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#1e3060] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {email ? email[0].toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{email}</p>
              <p className="text-[#8a9bbf] text-xs capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#8a9bbf] hover:text-red-400 hover:bg-[#1e3060] text-sm transition"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#101c34]">{sectionTitles[activeSection]}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <Star size={12} className="text-yellow-500" />
              {role?.toUpperCase()}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#101c34] flex items-center justify-center text-white text-sm font-bold">
              {email ? email[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {activeSection === 'overview' && <AdminOverview onNavigate={handleNav} />}
          {activeSection === 'hotels' && <HotelsManager />}
          {activeSection === 'cities' && <CitiesManager />}
          {activeSection === 'vendors' && <VendorsManager />}
          {activeSection === 'event-planners' && <EventPlannersManager />}
          {activeSection === 'blogs' && <BlogsManager />}
          {activeSection === 'awards' && <AwardsManager />}
          {activeSection === 'premier-destinations' && <PremierDestinationsManager />}
          {activeSection === 'registrations' && <RegistrationsManager />}
          {activeSection === 'inquiries' && <InquiriesManager />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
