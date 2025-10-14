import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Product, ProductsResponse } from '../models/Product';

export const getProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { cursor, limit = 20 } = req.query;
    
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    // For now, return mock data until we set up proper Shopify integration
    const mockProducts: Product[] = [
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

    const result: ProductsResponse = {
      products: mockProducts,
      hasNextPage: false,
      cursor: null,
    };

    res.json(result);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const searchProducts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, cursor, limit = 20 } = req.query;
    
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // For now, return mock search results
    const mockProducts: Product[] = [
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

    const result: ProductsResponse = {
      products: mockProducts,
      hasNextPage: false,
      cursor: null,
    };

    res.json(result);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
};

