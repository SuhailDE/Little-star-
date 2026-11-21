import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import LittleStarLogo from './LittleStarLogo.jsx';

const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/classes', label: 'Classes' },
  { to: '/approach', label: 'Approach' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E2ECF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2876C8] rounded-lg shrink-0"
        >
          <LittleStarLogo />
        </Link>

        {/* Zone 2: Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#2876C8] border-[#2876C8]'
                    : 'text-[#24364B]/80 border-transparent hover:text-[#2876C8] hover:border-[#FFD447]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Zone 3: Single Primary Action + Mobile Drawer Button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admission"
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors duration-150 whitespace-nowrap shrink-0 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2876C8] focus-visible:ring-offset-2"
          >
            Apply Now
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl text-[#24364B] hover:bg-[#EAF5FF] transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2ECF6] bg-white px-4 py-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#24364B] hover:bg-[#EAF5FF]"
          >
            Home
          </Link>
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-[#EAF5FF] text-[#2876C8] font-semibold'
                    : 'text-[#24364B] hover:bg-[#EAF5FF]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2">
            <Link
              to="/admission"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-[#2876C8] text-white text-sm font-semibold hover:bg-[#1E62AB] transition-colors"
            >
              Apply for Admission
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
