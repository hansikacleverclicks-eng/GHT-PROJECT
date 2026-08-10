import { Search, ChevronDown, Menu, X, Phone, Mail } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import ReactDOM from "react-dom";

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

const leftNavItems = [
  { label: "Hotels & Venues", path: "/all-hotels" },
  { label: "Vendors", path: "/vendors" },
  { label: "Event Planners", path: "/vendors/event-planners" },
  { label: "Premier Destinations", path: "/premier-destinations-DL-UK" },
];

const rightNavItems = [
  { label: "Awards", path: "/awards" },
  { label: "Current Affairs", path: "/current-affairs" },
  { label: "Blogs", path: "/blogs" },
  { label: "About Us", path: "/about" },
];

const cities = [
  "All Cities",
  "New Delhi", "Gurgaon", "Jaipur", "Goa", "Agra", "Mumbai",
  "Uttarakhand", "Jim Corbett", "Kerala", "Shimla", "Udaipur",
  "Varanasi", "Karnal", "Lonavala",
];

// Custom dropdown component using portal
const CityDropdown = ({ selectedCity, setSelectedCity, isOpen, setIsOpen, buttonRef }) => {
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen, buttonRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      className="fixed bg-[#0a0a12] border border-[#c9a84c]/30 rounded-xl shadow-2xl py-1 overflow-y-auto max-h-52"
      style={{
        top: position.top,
        left: position.left,
        minWidth: Math.max(position.width, 180),
        zIndex: 999999,
      }}
    >
      {cities.map((c) => (
        <div
          key={c}
          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
            selectedCity === c
              ? "text-[#c9a84c] font-semibold bg-[#c9a84c]/20"
              : "text-gray-200 hover:text-[#c9a84c] hover:bg-[#c9a84c]/10"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCity(c);
            setIsOpen(false);
          }}
        >
          {c}
        </div>
      ))}
    </div>,
    document.body
  );
};

const SecondTopHeader = () => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [cityOpen, setCityOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const cityButtonRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-[#c9a84c] font-semibold border-b-2 border-[#c9a84c]"
      : "text-gray-300 hover:text-[#c9a84c] transition-colors duration-200";
  };

  return (
    <>
      <header className="relative overflow-hidden">
        {/* Dark Luxury Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12]"></div>
        
        {/* Gold Accent Lines */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent"></div>
        
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             }}
        ></div>

        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c9a84c]/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-6">
          
          {/* ROW 1: Search + Contact - tighter padding */}
          <div className="flex items-center justify-between py-1">
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="flex border border-white/10 rounded-full w-full bg-white/5 backdrop-blur-sm hover:bg-white/10 focus-within:border-[#c9a84c] focus-within:ring-4 focus-within:ring-[#c9a84c]/20 transition-all duration-300 relative">
                
                {/* CITY DROPDOWN - USING PORTAL */}
                <div className="relative flex-shrink-0">
                  <button
                    ref={cityButtonRef}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-gray-300 text-sm border-r border-white/10 min-w-[110px] justify-between hover:text-[#c9a84c] transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCityOpen(!cityOpen);
                    }}
                  >
                    <span className="truncate text-sm font-medium">{selectedCity}</span>
                    <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${cityOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search hotels, venues, events..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-2.5 text-sm bg-transparent text-white outline-none flex-1 min-w-[150px] placeholder:text-gray-500"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />

                {searchText && (
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); setSearchText(""); }}
                    className="px-3 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  className="bg-gradient-to-r from-[#c9a84c] to-[#d4b85a] hover:from-[#d4b85a] hover:to-[#e8d5a3] text-[#0a0a12] px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a84c]/30 hover:scale-[1.02] flex-shrink-0 ml-1 font-semibold"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="hidden md:flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2.5 text-gray-400 hover:text-[#c9a84c] transition-colors">
                <Mail className="w-4 h-4" />
                <span className="hidden xl:inline">info@globalhotelsandtourism.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-gray-400 hover:text-[#c9a84c] transition-colors">
                <Phone className="w-4 h-4" />
                <span>+91 8449 103 104</span>
              </div>
              <Link
                to="/get-in-touch"
                className="bg-gradient-to-r from-[#c9a84c] to-[#d4b85a] hover:from-[#d4b85a] hover:to-[#e8d5a3] text-[#0a0a12] px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#c9a84c]/30 hover:scale-105 whitespace-nowrap"
              >
                Get In Touch
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden items-center gap-2">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-0 bg-[#0a0a12] border-r border-white/10">
                  <SheetTitle className="p-6 border-b border-white/10 text-[#c9a84c] text-lg font-bold">Menu</SheetTitle>
                  <nav className="flex flex-col">
                    {[...leftNavItems, ...rightNavItems].map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setSheetOpen(false)}
                        className="px-6 py-4 text-[15px] font-medium text-gray-300 hover:bg-white/5 hover:text-[#c9a84c] border-b border-white/5 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="p-6">
                      <Link
                        to="/join-as-vendor"
                        onClick={() => setSheetOpen(false)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#d4b85a] text-[#0a0a12] rounded-xl px-6 py-3.5 text-sm font-semibold hover:shadow-lg hover:shadow-[#c9a84c]/30 transition-all"
                      >
                        Join as Vendor
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
              <button
                className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3">
              <div className="flex items-center border border-white/10 rounded-full overflow-hidden bg-white/5 backdrop-blur-sm">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-4 py-2.5 bg-transparent text-white text-sm border-r border-white/10 outline-none min-w-[80px]"
                >
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Search hotels..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="px-4 py-2.5 text-sm bg-transparent text-white outline-none flex-1 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  className="bg-gradient-to-r from-[#c9a84c] to-[#d4b85a] text-[#0a0a12] px-5 py-2.5 rounded-full font-semibold"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ROW 2: Navigation + Logo - ZERO top padding, minimal bottom padding */}
          <div className="flex items-center justify-center pt-0 pb-1 border-t border-white/5 relative">
            
            {/* Left Nav */}
            <div className="hidden md:flex items-center justify-start flex-1">
              <nav className="flex items-center gap-0.5">
                {leftNavItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-2.5 lg:px-3.5 py-2 text-xs lg:text-sm font-light transition-all duration-200 whitespace-nowrap ${getLinkClass(item.path)}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Logo - CENTER - reduced margins on text */}
            <Link to="/" className="flex flex-col items-center group z-10 px-4">
              <img 
                src="/bglogo.png" 
                alt="GHT Logo" 
                className="h-20 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_40px_rgba(201,168,76,0.2)]" 
              />
              <span className="text-base font-bold text-white tracking-[0.2em] mt-0.5 drop-shadow-[0_0_30px_rgba(201,168,76,0.15)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                GLOBAL HOTELS & TOURISM
              </span>
              <span className="text-[11px] text-[#c9a84c] tracking-[0.3em] mt-0 font-light uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                A Royal Affair
              </span>
            </Link>

            {/* Right Nav */}
            <div className="hidden md:flex items-center justify-end flex-1">
              <nav className="flex items-center gap-0.5">
                {rightNavItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`px-2.5 lg:px-3.5 py-2 text-xs lg:text-sm font-light transition-all duration-200 whitespace-nowrap ${getLinkClass(item.path)}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

          </div>
        </div>
      </header>

      {/* Render dropdown via portal */}
      <CityDropdown
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        isOpen={cityOpen}
        setIsOpen={setCityOpen}
        buttonRef={cityButtonRef}
      />
    </>
  );
};

export default SecondTopHeader;