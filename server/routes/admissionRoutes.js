import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  convertAdmissionToStudent,
  deleteAdmission,
  getAdmissionDetails,
  listAdmissions,
  submitAdmission,
  trackAdmissionStatus,
  updateAdmissionStatus,
} from '../controllers/admissionController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const admissionSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many applications submitted. Please wait a few minutes.' },
});

router.post('/', admissionSubmitLimiter, submitAdmission);
router.get('/track/:applicationId', trackAdmissionStatus);

router.get('/', requireAdmin, listAdmissions);
router.get('/:id', requireAdmin, getAdmissionDetails);
router.patch('/:id/status', requireAdmin, updateAdmissionStatus);
router.post('/:id/convert', requireAdmin, convertAdmissionToStudent);
router.delete('/:id', requireAdmin, deleteAdmission);

export default router;
