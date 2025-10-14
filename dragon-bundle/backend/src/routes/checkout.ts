import { Router } from 'express';
import { createCheckout, getBundleAnalytics } from '../controllers/checkoutController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All checkout routes require authentication
router.use(authenticateToken);

// Create checkout from bundle
router.post('/create', createCheckout);

// Get bundle analytics
router.get('/analytics/:bundle_id', getBundleAnalytics);

export default router;

