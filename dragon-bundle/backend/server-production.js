const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for web interface)
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Shopify OAuth endpoints
app.get('/api/shop/install', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  // In production, you would redirect to Shopify OAuth
  const shopifyAuthUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${process.env.SHOPIFY_API_KEY}&` +
    `scope=${process.env.SHOPIFY_SCOPES}&` +
    `redirect_uri=${encodeURIComponent(process.env.SHOPIFY_APP_URL + '/api/shop/auth/callback')}&` +
    `state=${Date.now()}`;

  res.redirect(shopifyAuthUrl);
});

app.get('/api/shop/auth/callback', (req, res) => {
  const { code, shop, state } = req.query;
  
  if (!code || !shop) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // In production, you would exchange the code for an access token
  // For now, return success
  res.json({ 
    success: true, 
    message: 'Authentication successful',
    shop: shop
  });
});

// Products API
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

// Bundles API
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

app.get('/api/bundles/:id', (req, res) => {
  const bundle = {
    id: parseInt(req.params.id),
    title: 'Sample Bundle',
    description: 'A sample bundle',
    discount_type: 'percentage',
    discount_value: 10,
    items: [
      {
        product_id: 'gid://shopify/Product/1',
        variant_id: 'gid://shopify/ProductVariant/1',
        quantity: 1,
        title: 'Sporty Running Shoes',
        price: '99.99'
      }
    ],
    created_at: new Date().toISOString()
  };
  
  res.json(bundle);
});

// Checkout API
app.post('/api/checkout/create', (req, res) => {
  const { bundle_id } = req.body;
  
  res.json({
    checkout_id: 'checkout_' + bundle_id,
    checkout_url: 'https://checkout.shopify.com/sample-checkout',
    line_items: []
  });
});

// Serve the web interface at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../web-test.html'));
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
  console.log(`🌐 Web interface: http://localhost:${PORT}/`);
  console.log(`🔗 Install: http://localhost:${PORT}/api/shop/install?shop=your-shop.myshopify.com`);
});

module.exports = app;
