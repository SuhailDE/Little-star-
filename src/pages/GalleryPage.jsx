import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ResilientImage from '../components/ResilientImage.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { galleryApi } from '../services/api.js';

export default function GalleryPage() {
  const { settings } = useSettings();
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await galleryApi.list(selectedCategory === 'All' ? '' : selectedCategory);
        if (active) setItems(res.gallery || []);
      } catch {
        if (active) setError('Unable to load gallery photos right now.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [selectedCategory]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % items.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, items.length]);

  const categories = [
    'All',
    ...(settings.galleryCategories && settings.galleryCategories.length > 0
      ? settings.galleryCategories
      : ['Classroom', 'Learning Activities', 'Student Activities', 'Events', 'Institution']),
  ];

  const activeItem = lightboxIndex !== null ? items[lightboxIndex] : null;

  return (
    <div>
      <section className="bg-[#EAF5FF] border-b border-[#DCE8F5] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <p className="text-sm font-semibold text-[#2876C8]">Campus Moments</p>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#24364B]">
            Photo Gallery
          </h1>
          <p className="text-base text-[#52657A] max-w-2xl">
            Glimpses of classrooms, learning activities, and student engagement at{' '}
            {settings.institutionName || 'Little Star'}.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Segmented Category Filter */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#F4F8FC] border border-[#DCE8F5] rounded-xl w-fit">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#2876C8] text-white shadow-sm'
                    : 'text-[#52657A] hover:text-[#24364B] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="aspect-[4/3] rounded-2xl bg-[#F4F8FC] border border-[#DCE8F5] animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-[#DCE8F5] bg-[#F8FBFF] p-12 text-center space-y-2">
              <p className="font-display font-semibold text-lg text-[#24364B]">
                No photos in "{selectedCategory}" yet
              </p>
              <p className="text-sm text-[#52657A]">
                Administrators can upload photographs for this category from the Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, idx) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="group text-left bg-white rounded-2xl border border-[#DCE8F5] overflow-hidden hover:border-[#2876C8]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2876C8]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#EAF5FF]">
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      fallbackTitle={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <p className="text-xs font-medium text-[#2876C8]">
                      {item.category}
                      {item.isDemo ? ' · Demo Reference' : ''}
                    </p>
                    <h2 className="font-display font-semibold text-base text-[#24364B]">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="text-xs sm:text-sm text-[#52657A] line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-[#0F172A]/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E2ECF6]">
              <div>
                <p className="text-xs font-medium text-[#2876C8]">
                  {activeItem.category}
                  {activeItem.isDemo ? ' · Demo Reference' : ''}
                </p>
                <h3 className="font-display font-semibold text-base sm:text-lg text-[#24364B]">
                  {activeItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Close lightbox"
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#52657A] hover:bg-[#EAF5FF] hover:text-[#24364B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-[#0F172A] flex items-center justify-center max-h-[70vh]">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={() =>
                      setLightboxIndex((prev) => (prev - 1 + items.length) % items.length)
                    }
                    className="absolute left-3 w-11 h-11 rounded-full bg-white/90 text-[#24364B] flex items-center justify-center hover:bg-white shadow"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={() => setLightboxIndex((prev) => (prev + 1) % items.length)}
                    className="absolute right-3 w-11 h-11 rounded-full bg-white/90 text-[#24364B] flex items-center justify-center hover:bg-white shadow"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {activeItem.description && (
              <div className="px-5 py-4 bg-white border-t border-[#E2ECF6]">
                <p className="text-sm text-[#52657A]">{activeItem.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
