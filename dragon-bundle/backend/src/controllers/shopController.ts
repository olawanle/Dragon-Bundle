import { Request, Response } from 'express';
import { database } from '../models/database';
import { generateToken } from '../middleware/auth';

export const installApp = async (req: Request, res: Response) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter is required' });
    }

    // For now, simulate successful installation
    const mockAccessToken = 'mock_access_token_' + Date.now();
    
    // Store shop data in database
    await database.run(
      `INSERT OR REPLACE INTO shops (shop_domain, access_token, scope) 
       VALUES (?, ?, ?)`,
      [shop as string, mockAccessToken, 'read_products,write_products,read_orders']
    );

    // Generate JWT token for mobile app
    const token = generateToken(shop as string);

    // Return success response
    res.json({ 
      success: true, 
      token, 
      shop: shop as string,
      message: 'App installed successfully (mock mode)' 
    });
  } catch (error) {
    console.error('Install error:', error);
    res.status(500).json({ error: 'Failed to initiate app installation' });
  }
};

export const authCallback = async (req: Request, res: Response) => {
  try {
    const { shop, code, state } = req.query;

    if (!shop) {
      return res.status(400).json({ error: 'Missing shop parameter' });
    }

    // For now, simulate successful authentication
    const mockAccessToken = 'mock_access_token_' + Date.now();
    
    // Store shop data in database
    await database.run(
      `INSERT OR REPLACE INTO shops (shop_domain, access_token, scope) 
       VALUES (?, ?, ?)`,
      [shop as string, mockAccessToken, 'read_products,write_products,read_orders']
    );

    // Generate JWT token for mobile app
    const token = generateToken(shop as string);

    // Return success response
    res.json({ 
      success: true, 
      token, 
      shop: shop as string,
      message: 'Authentication successful (mock mode)' 
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const getShopInfo = async (req: Request, res: Response) => {
  try {
    const { shop_domain } = req.body;
    
    const shop = await database.get(
      'SELECT shop_domain, created_at FROM shops WHERE shop_domain = ?',
      [shop_domain]
    );

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json({ shop });
  } catch (error) {
    console.error('Get shop info error:', error);
    res.status(500).json({ error: 'Failed to get shop info' });
  }
};

