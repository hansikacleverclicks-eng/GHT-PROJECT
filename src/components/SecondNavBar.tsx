import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

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

const SecondNavBar = () => {
  return (
    <nav className="hidden md:block bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <ul className="flex items-center justify-between">
          {navItems.map((item) => (
            <li key={item.label} className="flex-shrink-0">
              <Link
                to={item.path}
                className="flex items-center gap-1 px-2 lg:px-3 py-3 text-sm lg:text-[15px] font-medium text-gray-700 hover:text-[#101c34] transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SecondNavBar;