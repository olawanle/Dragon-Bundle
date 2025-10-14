const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mock API endpoints for testing
app.get('/api/products', (req, res) => {
  const mockProducts = [
    {
      id: 'gid://shopify/Product/1',
      title: 'Sporty Running Shoes',
      description: 'Comfortable running shoes for all terrains',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          altText: 'Running shoes'
        }
      ],
      variants: [
        {
          id: 'gid://shopify/ProductVariant/1',
          title: 'Default Title',
          price: '99.99',
          availableForSale: true,
          inventoryQuantity: 15,
          selectedOptions: [
            { name: 'Size', value: '10' },
            { name: 'Color', value: 'Black' }
          ]
        }
      ]
    },
    {
      id: 'gid://shopify/Product/2',
      title: 'Classic Cotton Tee',
      description: 'Soft cotton t-shirt for everyday wear',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          altText: 'Cotton t-shirt'
        }
      ],
      variants: [
        {
          id: 'gid://shopify/ProductVariant/2',
          title: 'Default Title',
          price: '24.99',
          availableForSale: true,
          inventoryQuantity: 25,
          selectedOptions: [
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'White' }
          ]
        }
      ]
    }
  ];

  res.json({
    products: mockProducts,
    hasNextPage: false,
    cursor: null
  });
});

app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const mockProducts = [
    {
      id: 'gid://shopify/Product/3',
      title: 'Relaxed Fit Jeans',
      description: 'Comfortable jeans for casual wear',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
          altText: 'Jeans'
        }
      ],
      variants: [
        {
          id: 'gid://shopify/ProductVariant/3',
          title: 'Default Title',
          price: '79.99',
          availableForSale: true,
          inventoryQuantity: 5,
          selectedOptions: [
            { name: 'Size', value: '32' },
            { name: 'Color', value: 'Blue' }
          ]
        }
      ]
    }
  ];

  res.json({
    products: mockProducts,
    hasNextPage: false,
    cursor: null
  });
});

app.get('/api/shop/install', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  // Mock successful installation
  res.json({ 
    success: true, 
    token: 'mock_jwt_token_' + Date.now(),
    shop: shop,
    message: 'App installed successfully (mock mode)' 
  });
});

app.get('/api/bundles', (req, res) => {
  res.json([]);
});

app.post('/api/bundles', (req, res) => {
  const bundle = {
    id: Date.now(),
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  res.status(201).json(bundle);
});

app.post('/api/checkout/create', (req, res) => {
  const { bundle_id } = req.body;
  
  res.json({
    checkout_id: 'mock_checkout_' + bundle_id,
    checkout_url: 'https://checkout.shopify.com/mock-checkout',
    line_items: []
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dragon Bundle Backend running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Mock install: http://localhost:${PORT}/api/shop/install?shop=test-shop.myshopify.com`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
});

module.exports = app;
