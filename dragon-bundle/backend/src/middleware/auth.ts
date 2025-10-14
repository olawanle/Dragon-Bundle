import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { database } from '../models/database';

export interface AuthenticatedRequest extends Request {
  shop?: {
    shop_domain: string;
    access_token: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { shop_domain: string };
    
    // Verify shop exists in database
    const shop = await database.get(
      'SELECT shop_domain, access_token FROM shops WHERE shop_domain = ?',
      [decoded.shop_domain]
    );

    if (!shop) {
      return res.status(401).json({ error: 'Invalid shop' });
    }

    req.shop = {
      shop_domain: shop.shop_domain,
      access_token: shop.access_token
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const generateToken = (shop_domain: string): string => {
  return jwt.sign({ shop_domain }, process.env.JWT_SECRET!, { expiresIn: '24h' });
};

