import { Router } from 'express';
import { installApp, authCallback, getShopInfo } from '../controllers/shopController';

const router = Router();

// OAuth routes
router.get('/install', installApp);
router.get('/auth/callback', authCallback);

// Shop info route
router.post('/info', getShopInfo);

export default router;

