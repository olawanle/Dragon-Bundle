import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import shopRoutes from './routes/shop';
import productRoutes from './routes/products';
import bundleRoutes from './routes/bundles';
import checkoutRoutes from './routes/checkout';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/shop', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/checkout', checkoutRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dragon Bundle Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Shopify install: http://localhost:${PORT}/api/shop/install?shop=your-shop.myshopify.com`);
});

export default app;

