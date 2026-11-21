export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatInputDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function formatTelHref(phone) {
  if (!phone) return '#';
  const cleaned = String(phone).replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export function formatWhatsAppHref(phone, message = '') {
  if (!phone) return '#';
  let digits = String(phone).replace(/\D/g, '');
  // Normalize Bangladeshi 11-digit local number (01XXXXXXXXX -> 8801XXXXXXXXX)
  if (digits.startsWith('01') && digits.length === 11) {
    digits = `88${digits}`;
  }
  const base = `https://wa.me/${digits}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}

export function isSafeHttpUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getEmbeddableMapUrl(url) {
  if (!isSafeHttpUrl(url)) return null;
  const trimmed = url.trim();
  if (
    trimmed.includes('google.com/maps/embed') ||
    trimmed.includes('maps.google.com/maps') && trimmed.includes('output=embed')
  ) {
    return trimmed;
  }
  return null;
}

export function calculateAgeYears(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
