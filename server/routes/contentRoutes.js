import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createGalleryItem,
  createNotice,
  deleteContactMessage,
  deleteGalleryItem,
  deleteNotice,
  getWebsiteSettings,
  listContactMessages,
  listGallery,
  listNotices,
  markMessageRead,
  submitContactMessage,
  updateGalleryItem,
  updateNotice,
  updateWebsiteSettings,
  uploadLogoAsset,
} from '../controllers/contentController.js';
import { requireAdmin } from '../middleware/auth.js';
import { uploadSingleImage } from '../middleware/upload.js';

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact requests. Please try again shortly.' },
});

export const galleryRouter = Router();
galleryRouter.get('/', listGallery);
galleryRouter.post('/', requireAdmin, uploadSingleImage, createGalleryItem);
galleryRouter.put('/:id', requireAdmin, uploadSingleImage, updateGalleryItem);
galleryRouter.delete('/:id', requireAdmin, deleteGalleryItem);

export const noticeRouter = Router();
noticeRouter.get('/', listNotices);
noticeRouter.post('/', requireAdmin, createNotice);
noticeRouter.put('/:id', requireAdmin, updateNotice);
noticeRouter.delete('/:id', requireAdmin, deleteNotice);

export const contactRouter = Router();
contactRouter.post('/', contactLimiter, submitContactMessage);
contactRouter.get('/', requireAdmin, listContactMessages);
contactRouter.patch('/:id/read', requireAdmin, markMessageRead);
contactRouter.delete('/:id', requireAdmin, deleteContactMessage);

export const settingsRouter = Router();
settingsRouter.get('/', getWebsiteSettings);
settingsRouter.put('/', requireAdmin, updateWebsiteSettings);
settingsRouter.post('/logo', requireAdmin, uploadSingleImage, uploadLogoAsset);
