import { Router } from 'express';
import { 
  createBundle, 
  getBundles, 
  getBundle, 
  updateBundle, 
  deleteBundle 
} from '../controllers/bundleController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All bundle routes require authentication
router.use(authenticateToken);

// Bundle CRUD operations
router.post('/', createBundle);
router.get('/', getBundles);
router.get('/:id', getBundle);
router.put('/:id', updateBundle);
router.delete('/:id', deleteBundle);

export default router;

