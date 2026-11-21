import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { dataStore } from '../services/dataStore.js';
import { AppError } from '../utils/validators.js';

export const ADMIN_COOKIE_NAME = 'ls_admin_token';

function isSecureContext(req) {
  const proto = req.headers['x-forwarded-proto'];
  return req.secure || proto === 'https' || env.isProduction;
}

export function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: String(admin._id),
      email: admin.email,
      role: admin.role || 'admin',
    },
    env.jwtSecret,
    { expiresIn: '24h' }
  );
}

export function issueAuthCookie(req, res, token) {
  const secure = isSecureContext(req);
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    partitioned: secure,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(req, res) {
  const secure = isSecureContext(req);
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    partitioned: secure,
    path: '/',
  });
}

export async function requireAdmin(req, _res, next) {
  try {
    let token = req.cookies?.[ADMIN_COOKIE_NAME];
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (!token) {
      return next(new AppError('Authentication required.', 401));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    if (!decoded?.sub) {
      return next(new AppError('Invalid authentication token.', 401));
    }

    const admin = await dataStore.findAdminById(decoded.sub);
    if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
      return next(new AppError('Administrator access denied.', 403));
    }

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return next(new AppError('Session expired or invalid. Please sign in again.', 401));
    }
    next(err);
  }
}

/**
 * CSRF protection tailored for cookie-based SPA authentication:
 * Requires either X-Requested-With: XMLHttpRequest (set by our Axios client)
 * or a verified same-origin Origin/Referer header on state-changing requests.
 */
export function verifyCsrf(req, _res, next) {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  // Only enforce strict CSRF check if the request carries an auth cookie or hits an admin/auth route
  const hasAuthCookie = Boolean(req.cookies?.[ADMIN_COOKIE_NAME]);
  const xRequestedWith = req.headers['x-requested-with'];

  if (xRequestedWith === 'XMLHttpRequest') {
    // Also validate Origin if provided by the browser
    const origin = req.headers.origin;
    if (origin) {
      try {
        const originHost = new URL(origin).host;
        const expectedHost = req.headers['x-forwarded-host'] || req.headers.host;
        const allowedHosts = new Set([expectedHost]);
        if (env.appUrl) allowedHosts.add(new URL(env.appUrl).host);
        if (env.clientUrl) {
          env.clientUrl
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean)
            .forEach((u) => {
              try {
                allowedHosts.add(new URL(u).host);
              } catch {
                // ignore malformed env URL
              }
            });
        }
        if (expectedHost && !allowedHosts.has(originHost)) {
          return next(new AppError('Cross-origin request blocked by CSRF policy.', 403));
        }
      } catch {
        return next(new AppError('Invalid request origin.', 403));
      }
    }
    return next();
  }

  if (hasAuthCookie) {
    return next(new AppError('Missing CSRF protection header.', 403));
  }

  next();
}
