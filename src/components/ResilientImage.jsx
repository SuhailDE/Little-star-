import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'Little Star',
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#EAF5FF] to-[#D8EBFF] text-[#2876C8] p-6 text-center ${className}`}
        role="img"
        aria-label={alt || fallbackTitle}
      >
        <ImageIcon className="w-8 h-8 mb-2 opacity-70" />
        <span className="font-display font-semibold text-sm text-[#24364B] max-w-[20ch] truncate">
          {fallbackTitle}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || fallbackTitle}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
