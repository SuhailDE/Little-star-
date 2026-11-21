import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { clearAuthCookie, issueAuthCookie, signAdminToken } from '../middleware/auth.js';
import { dataStore } from '../services/dataStore.js';
import { AppError, cleanString, isValidEmail } from '../utils/validators.js';

export async function getSetupStatus(_req, res, next) {
  try {
    const adminCount = await dataStore.countAdmins();
    const envConfigured = Boolean(env.adminEmail && env.adminPassword);
    res.json({
      success: true,
      needsSetup: adminCount === 0 && !envConfigured,
    });
  } catch (err) {
    next(err);
  }
}

export async function claimInitialAdmin(req, res, next) {
  try {
    const adminCount = await dataStore.countAdmins();
    if (adminCount > 0 || (env.adminEmail && env.adminPassword)) {
      return next(
        new AppError('Administrator account has already been initialized. Public registration is disabled.', 403)
      );
    }

    const name = cleanString(req.body.name, 100) || 'Selina Parveen (Munni)';
    const email = cleanString(req.body.email, 150).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email)) {
      return next(new AppError('Please provide a valid administrator email address.', 400));
    }
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long.', 400));
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await dataStore.createAdmin({
      name,
      email,
      passwordHash,
      role: 'superadmin',
      lastLoginAt: new Date().toISOString(),
    });

    const token = signAdminToken(admin);
    issueAuthCookie(req, res, token);

    const { passwordHash: _omit, ...safeAdmin } = admin;
    res.status(201).json({
      success: true,
      message: 'Administrator account created and signed in.',
      admin: safeAdmin,
    });
  } catch (err) {
    next(err);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const email = cleanString(req.body.email, 150).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!isValidEmail(email) || !password) {
      return next(new AppError('Email and password are required.', 400));
    }

    const admin = await dataStore.findAdminByEmail(email);
    if (!admin) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password.', 401));
    }

    await dataStore.updateAdmin(admin._id, { lastLoginAt: new Date().toISOString() });
    const token = signAdminToken(admin);
    issueAuthCookie(req, res, token);

    const { passwordHash: _omit, ...safeAdmin } = admin;
    res.json({
      success: true,
      message: 'Signed in successfully.',
      admin: safeAdmin,
    });
  } catch (err) {
    next(err);
  }
}

export function logoutAdmin(req, res) {
  clearAuthCookie(req, res);
  res.json({ success: true, message: 'Signed out successfully.' });
}

export function getCurrentAdmin(req, res) {
  res.json({
    success: true,
    admin: req.admin,
  });
}
