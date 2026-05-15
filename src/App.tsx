import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Footer from './components/Footer';
import Index from './pages/Index';
import AllHotels from './pages/AllHotels';
import AllVendors from './pages/AllVendors';
import AddBlog from './pages/AddBlog';
import EventPlanners from './pages/EventPlanners';
import AllCities from './pages/AllCities';
import CityPage from './pages/CityPage';
import Awards from './pages/Awards';
import VendorProfile from './pages/VendorProfile';
import CurrentAffairs from './pages/CurrentAffairs';
import BlogPost from './pages/BlogPost';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import VendorRegistration from './pages/VendorRegistration';
import VendorBenefits from './pages/VendorBenefits';
import JoinAsVendor from './pages/JoinAsVendor';
import ParentCompanyHotels from './pages/ParentCompanyHotels';
import CityHotels from './pages/CityHotels';
import PremierDestinations from './pages/PremierDestinations';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { useAuth } from './hooks/useAuth';
import { Navigate } from 'react-router-dom';
import JoinPopup from './components/JoinPopup';
import DynamicSEO from './components/seo/DynamicSEO';
import GlobalInquiry from './pages/GlobalInquiry';
import About from './pages/About';
import SecondTopHeader from './components/SecondTopHeader';
import SecondNavBar from './components/SecondNavBar';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { authenticated, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return authenticated ? children : <Navigate to="/admin" replace />;
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicSEO />
      {!isAdminRoute && (
        <>
          <JoinPopup />
          <SecondTopHeader />
          <SecondNavBar />
        </>
      )}
      <main className={isAdminRoute ? '' : 'flex-grow'}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/hotels" element={<AllHotels />} />
          <Route path="/all-hotels" element={<AllHotels />} />
          <Route path="/vendors" element={<AllVendors />} />
          <Route path="/vendor/:id" element={<VendorProfile />} />
          <Route path="/vendors/event-planners" element={<EventPlanners />} />
          <Route path="/AllCities" element={<AllCities />} />
          <Route path="/allcities" element={<AllCities />} />
          <Route path="/city/:slug" element={<CityPage />} />
          <Route path="/parent-company/:parentCompanySlug" element={<ParentCompanyHotels />} />
          <Route path="/city-hotels/:citySlug" element={<CityHotels />} />
          <Route path="/premier-destinations-DL-UK" element={<PremierDestinations />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetail />} />
          <Route path="/add-blog" element={<AddBlog />} />
          <Route path="/vendor-registration" element={<VendorRegistration />} />
          <Route path="/join-as-vendor" element={<JoinAsVendor />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/disclaimer" element={<TermsOfService />} />
          <Route path="/inquiry" element={<GlobalInquiry />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}