export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/**
 * Recursively strips MongoDB operator keys ($...) and dotted keys to prevent NoSQL injection.
 */
export function sanitizeObject(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeObject(item));
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const cleaned = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleaned[key] = sanitizeObject(val);
    }
    return cleaned;
  }
  return value;
}

export function cleanString(val, maxLen = 500) {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/[\s\-+()]/g, '');
  return digits.length >= 8 && digits.length <= 15 && /^\d+$/.test(digits);
}

export function isSafeUrl(url, allowRelative = true) {
  if (!url) return true;
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (allowRelative && trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function calculateAgeYears(dobString) {
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

export function toSlug(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
