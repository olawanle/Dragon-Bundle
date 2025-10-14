import { Router } from 'express';
import { getProducts, searchProducts } from '../controllers/productController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All product routes require authentication
router.use(authenticateToken);

// Get products with pagination
router.get('/', getProducts);

// Search products
router.get('/search', searchProducts);

export default router;

