import { ExternalLink, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatTelHref, isSafeHttpUrl } from '../utils/formatters.js';
import LittleStarLogo from './LittleStarLogo.jsx';

export default function Footer() {
  const { settings } = useSettings();
  const phones =
    settings.phones && settings.phones.length > 0
      ? settings.phones
      : ['01636-021582', '01682-225117'];

  return (
    <footer className="bg-[#24364B] text-white border-t border-[#1C2B3D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <LittleStarLogo lightText />
            <p className="text-sm text-white/80 leading-relaxed max-w-xs">
              {settings.tagline || 'A Caring Place for Young Learners'}. Directed by{' '}
              <span className="font-semibold text-white">
                {settings.directorName || 'Selina Parveen (Munni)'}
              </span>
              .
            </p>
            <p className="text-xs text-[#FFD447] font-medium">
              Admission Status: {settings.admissionStatus || 'Open'}
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white mb-4">
              Explore Little Star
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/" className="hover:text-[#FFD447] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#FFD447] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/classes" className="hover:text-[#FFD447] transition-colors">
                  Classes &amp; Courses
                </Link>
              </li>
              <li>
                <Link to="/approach" className="hover:text-[#FFD447] transition-colors">
                  Our Teaching Approach
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-[#FFD447] transition-colors">
                  Photo Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Admissions & Portal */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white mb-4">
              Admissions &amp; Information
            </h3>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/admission" className="hover:text-[#FFD447] transition-colors">
                  Apply for Admission
                </Link>
              </li>
              <li>
                <Link to="/admission?tab=track" className="hover:text-[#FFD447] transition-colors">
                  Track Application Status
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#FFD447] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#FFD447] transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-display font-semibold text-sm text-white mb-4">
              Official Contact
            </h3>
            <div className="space-y-3 text-sm text-white/80">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={formatTelHref(phone)}
                  className="flex items-center gap-2.5 hover:text-[#FFD447] transition-colors tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#FFD447] shrink-0" />
                  <span>{phone}</span>
                </a>
              ))}

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFD447] shrink-0 mt-0.5" />
                <span>
                  {settings.address
                    ? settings.address
                    : 'Campus address to be configured by administration.'}
                </span>
              </div>

              {isSafeHttpUrl(settings.facebookUrl) && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#FFD447] hover:underline pt-1"
                >
                  <span>Official Facebook Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>
            &copy; {new Date().getFullYear()} {settings.institutionName || 'Little Star'}. All rights
            reserved.
          </p>
          <p>Director: {settings.directorName || 'Selina Parveen (Munni)'} &middot; Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
