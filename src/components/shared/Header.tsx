import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronDown, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const cities = [
  "All Cities", "New Delhi", "Gurgaon", "Jaipur", "Goa", "Agra", "Mumbai",
  "Uttarakhand", "Jim Corbett", "Kerala", "Shimla", "Udaipur",
  "Varanasi", "Karnal", "Lonavala",
];

const mobileNavItems = [
  { label: "Hotels & Venues", path: "/all-hotels" },
  { label: "Vendors", path: "/vendors" },
  { label: "Event Planners", path: "/vendors/event-planners" },
  { label: "Premier Destinations", path: "/premier-destinations-DL-UK" },
  { label: "Awards", path: "/awards" },
  { label: "Current Affairs", path: "/current-affairs" },
  { label: "Blogs", path: "/blogs" },
  { label: "About Us", path: "/about" },
];

const navItems = [
  { label: "Hotels & Venues", path: "/all-hotels" },
  { label: "Vendors", path: "/vendors" },
  { label: "Event Planners", path: "/vendors/event-planners" },
  { label: "Premier Destinations", path: "/premier-destinations-DL-UK" },
  { label: "Awards", path: "/awards" },
  { label: "Current Affairs", path: "/current-affairs" },
  { label: "Blogs", path: "/blogs" },
  { label: "About Us", path: "/about" },
];

const Header = () => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const desktopCityRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <>
      {/* TOP HEADER */}
      <header className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
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

            {/* Desktop Search Bar - LEFT SIDE */}
            <div className="hidden md:flex items-center flex-1 max-w-lg">
              <div className="flex border border-gray-300 rounded overflow-visible w-full">
                <div ref={desktopCityRef} className="relative flex-shrink-0">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-1.5 bg-white text-gray-700 text-sm border-r border-gray-300 min-w-[130px] justify-between hover:bg-gray-50"
                    onClick={() => setCityOpen(v => !v)}
                  >
                    <span className="truncate">{selectedCity}</span>
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
                  className="px-4 py-1.5 text-sm bg-white text-gray-700 outline-none flex-1 min-w-[120px] placeholder:text-gray-400"
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

            {/* Logo - CENTERED */}
            <Link to="/" className="flex items-center gap-2 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
              <img src="/bglogo.png" alt="GHT Logo" className="h-11" />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-900 tracking-tight">Global Hotels & Tourism</span>
              </div>
            </Link>

            {/* Join as Vendor - RIGHT SIDE */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/join-as-vendor"
                className="bg-[#101c34] text-white px-4 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Join as Vendor
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
              <Link to="/join-as-vendor" className="text-xs bg-[#101c34] text-white px-3 py-1 rounded">
                Join
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

      {/* BOTTOM NAVIGATION */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-between">
            {navItems.map((item, index) => (
              <li key={index} className="flex-shrink-0">
                <Link
                  to={item.path}
                  className="flex items-center gap-1 px-2 lg:px-3 py-2 text-sm lg:text-[15px] font-medium text-gray-700 hover:text-[#101c34] transition-colors whitespace-nowrap"
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