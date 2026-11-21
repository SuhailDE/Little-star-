import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  claimInitialAdmin,
  getCurrentAdmin,
  getSetupStatus,
  loginAdmin,
  logoutAdmin,
} from '../controllers/authController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

router.get('/setup-status', getSetupStatus);
router.post('/claim-admin', authLimiter, claimInitialAdmin);
router.post('/login', authLimiter, loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/me', requireAdmin, getCurrentAdmin);

export default router;
