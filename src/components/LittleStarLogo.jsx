import { useSettings } from '../context/SettingsContext.jsx';

export function StarEmblem({ className = 'w-9 h-9' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="#2876C8" />
      <path
        d="M32 12L37.8 24.1L51.1 25.9L41.4 35.2L43.8 48.5L32 42.1L20.2 48.5L22.6 35.2L12.9 25.9L26.2 24.1L32 12Z"
        fill="#FFD447"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LittleStarLogo({ size = 'md', lightText = false }) {
  const { settings } = useSettings();
  const emblemSize = size === 'lg' ? 'w-11 h-11' : size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
      {settings.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings.institutionName || 'Little Star'}
          referrerPolicy="no-referrer"
          className={`${emblemSize} rounded-xl object-cover shrink-0 border border-[#D8E7F5] bg-white`}
        />
      ) : (
        <StarEmblem className={`${emblemSize} shrink-0`} />
      )}
      <span
        className={`font-display font-bold tracking-tight ${textSize} ${
          lightText ? 'text-white' : 'text-[#24364B]'
        }`}
      >
        {settings.institutionName || 'Little Star'}
      </span>
    </span>
  );
}
