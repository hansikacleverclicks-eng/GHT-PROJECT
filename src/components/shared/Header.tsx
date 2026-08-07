import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, Menu, X, Phone, Mail } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const cities = [
  "All Cities", "New Delhi", "Gurgaon", "Jaipur", "Goa", "Agra", "Mumbai",
  "Uttarakhand", "Jim Corbett", "Kerala", "Shimla", "Udaipur",
  "Varanasi", "Karnal", "Lonavala",
];

const mobileNavItems = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Weddings", path: "/weddings" },
  { label: "Destinations", path: "/destinations" },
  { label: "Venues", path: "/all-hotels" },
  { label: "Services", path: "/services" },
  { label: "Gallery", path: "/gallery" },
  { label: "Blog", path: "/blogs" },
  { label: "Contact Us", path: "/contact" },
];

const navItems = [
  { label: "HOME", path: "/" },
  { label: "ABOUT US", path: "/about" },
  { label: "WEDDINGS", path: "/weddings" },
  { label: "DESTINATIONS", path: "/destinations" },
  { label: "GLOBAL HOTELS & TOURISM", path: "/" },
  { label: "VENUES", path: "/all-hotels" },
  { label: "SERVICES", path: "/services" },
  { label: "GALLERY", path: "/gallery" },
  { label: "BLOG", path: "/blogs" },
  { label: "CONTACT US", path: "/contact" },
];

const Header = () => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const desktopCityRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if (desktopCityRef.current && !desktopCityRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = useCallback(() => {
    const p = new URLSearchParams();
    if (selectedCity && selectedCity !== "All Cities") p.set("city", selectedCity);
    if (searchText.trim()) p.set("name", searchText.trim());
    navigate(`/all-hotels${p.toString() ? `?${p}` : ""}`);
    setCityOpen(false);
  }, [selectedCity, searchText, navigate]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const getLinkClass = (path, baseClass) => {
    return location.pathname === path
      ? `text-[#101c34] ${baseClass}`
      : `text-gray-700 hover:text-[#101c34] ${baseClass}`;
  };

  return (
    <>
      {/* TOP HEADER - Logo Left, Contact Right */}
      <header className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu */}
            <div className="flex md:hidden">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-gray-700">
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetTitle className="p-4 border-b border-gray-200">Menu</SheetTitle>
                  <nav className="flex flex-col">
                    {mobileNavItems.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setSheetOpen(false)}
                        className="px-4 py-3 text-[15px] font-medium text-gray-700 hover:bg-[#f0f2f7] hover:text-[#101c34] border-b border-gray-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="p-4">
                      <Link
                        to="/join-as-vendor"
                        onClick={() => setSheetOpen(false)}
                        className="flex items-center justify-center gap-2 bg-[#101c34] text-white rounded px-5 py-2 text-sm font-medium"
                      >
                        Join as Vendor
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo - LEFT SIDE */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/bglogo.png" alt="GHT Logo" className="h-10" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-900 tracking-tight">Global Hotels & Tourism</span>
              </div>
            </Link>

            {/* Desktop Search Bar - Center */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="flex border border-gray-300 rounded overflow-visible w-full">
                <div ref={desktopCityRef} className="relative flex-shrink-0">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 text-sm border-r border-gray-300 min-w-[110px] justify-between hover:bg-gray-50"
                    onClick={() => setCityOpen(v => !v)}
                  >
                    <span className="truncate text-xs">{selectedCity}</span>
                    <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${cityOpen ? "rotate-180" : ""}`} />
                  </button>
                  {cityOpen && (
                    <ul className="absolute top-full left-0 bg-white border border-gray-200 rounded shadow-xl z-[9999] min-w-[160px] max-h-52 overflow-y-auto">
                      {cities.map((c) => (
                        <li
                          key={c}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#f0f2f7] ${selectedCity === c ? "bg-[#f0f2f7] font-semibold text-[#101c34]" : "text-gray-700"}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedCity(c);
                            setCityOpen(false);
                          }}
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Search Hotels, Venues, Planners..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-3 py-1.5 text-sm bg-white text-gray-700 outline-none flex-1 min-w-[100px] placeholder:text-gray-400"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />

                {searchText && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setSearchText(""); }}
                    className="px-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  className="bg-[#101c34] hover:bg-[#1a2d52] text-white px-3 py-1.5 transition-colors flex-shrink-0"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact Info - RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4 text-sm flex-shrink-0">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="hidden lg:inline">info@globalhotelsandtourism.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>+918449103104</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Follow Us:</span>
                <a href="#" className="text-gray-600 hover:text-[#101c34] font-medium">in</a>
              </div>
              <Link
                to="/get-in-touch"
                className="bg-[#101c34] text-white px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get In Touch
              </Link>
            </div>

            {/* Mobile Right Icons */}
            <div className="flex md:hidden items-center gap-2">
              <button
                className="p-2 text-gray-700"
                onClick={() => setMobileSearchOpen(v => !v)}
              >
                <Search className="w-5 h-5" />
              </button>
              <Link to="/get-in-touch" className="text-xs bg-[#101c34] text-white px-3 py-1 rounded">
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="md:hidden px-0 pb-2 pt-2">
              <div className="flex border border-gray-300 rounded overflow-hidden">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3 py-2 bg-white text-gray-700 text-xs border-r border-gray-300 outline-none"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Search Hotels, Venues..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-3 py-2 text-xs bg-white text-gray-700 outline-none flex-1 placeholder:text-gray-400"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  className="bg-[#101c34] text-white px-3 py-2"
                  onClick={handleSearch}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* BOTTOM NAVIGATION - Centered */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-1">
            {navItems.map((item, index) => (
              <li key={index} className="flex-shrink-0">
                <Link
                  to={item.path}
                  className={getLinkClass(
                    item.path,
                    'flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-[#101c34] transition-colors whitespace-nowrap uppercase tracking-wide'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;