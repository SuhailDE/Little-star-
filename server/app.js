import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { UPLOADS_DIR } from './config/cloudinary.js';
import { getDatabaseMode } from './config/db.js';
import { env } from './config/env.js';
import { getDashboardStats } from './controllers/studentController.js';
import { requireAdmin, verifyCsrf } from './middleware/auth.js';
import { errorHandler, notFoundApiHandler } from './middleware/errorHandler.js';
import { sanitizeInputs } from './middleware/sanitize.js';
import { classRouter, courseRouter } from './routes/academicRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import {
  contactRouter,
  galleryRouter,
  noticeRouter,
  settingsRouter,
} from './routes/contentRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

export function createExpressApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      xFrameOptions: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  const allowedOrigins = new Set(
    [
      env.appUrl,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      ...env.clientUrl.split(',').map((s) => s.trim()),
    ].filter(Boolean)
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        try {
          const parsed = new URL(origin);
          if (
            parsed.hostname === 'localhost' ||
            parsed.hostname === '127.0.0.1' ||
            parsed.hostname.endsWith('.run.app')
          ) {
            return callback(null, true);
          }
        } catch {
          // ignore parse error
        }
        return callback(new Error('Origin not permitted by CORS policy.'));
      },
      credentials: true,
    })
  );

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', apiLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(sanitizeInputs);
  app.use('/api', verifyCsrf);

  // Serve locally stored uploaded gallery/logo assets when Cloudinary is not configured
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '7d' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      service: 'Little Star API',
      databaseMode: getDatabaseMode(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admissions', admissionRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/classes', classRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/gallery', galleryRouter);
  app.use('/api/notices', noticeRouter);
  app.use('/api/contact', contactRouter);
  app.use('/api/settings', settingsRouter);
  app.get('/api/dashboard/stats', requireAdmin, getDashboardStats);

  app.use('/api', notFoundApiHandler);
  app.use(errorHandler);

  return app;
}
