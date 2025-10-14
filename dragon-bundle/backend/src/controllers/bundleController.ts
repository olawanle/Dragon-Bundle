import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { database } from '../models/database';
import { Bundle, CreateBundleRequest, BundleItem } from '../models/Bundle';

export const createBundle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const bundleData: CreateBundleRequest = req.body;

    // Validate bundle data
    if (!bundleData.title || !bundleData.items || bundleData.items.length < 2) {
      return res.status(400).json({ 
        error: 'Bundle must have a title and at least 2 items' 
      });
    }

    if (bundleData.items.length > 6) {
      return res.status(400).json({ 
        error: 'Bundle cannot have more than 6 items' 
      });
    }

    if (!['percentage', 'fixed'].includes(bundleData.discount_type)) {
      return res.status(400).json({ 
        error: 'Invalid discount type. Must be "percentage" or "fixed"' 
      });
    }

    // Insert bundle into database
    const result = await database.run(
      `INSERT INTO bundles (shop_domain, title, description, cover_image_url, discount_type, discount_value, items)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.shop.shop_domain,
        bundleData.title,
        bundleData.description || null,
        bundleData.cover_image_url || null,
        bundleData.discount_type,
        bundleData.discount_value,
        JSON.stringify(bundleData.items)
      ]
    );

    const bundleId = (result as any).lastID;
    
    // Fetch the created bundle
    const bundle = await database.get(
      'SELECT * FROM bundles WHERE id = ?',
      [bundleId]
    );

    if (!bundle) {
      return res.status(500).json({ error: 'Failed to create bundle' });
    }

    const createdBundle: Bundle = {
      ...bundle,
      items: JSON.parse(bundle.items)
    };

    res.status(201).json(createdBundle);
  } catch (error) {
    console.error('Create bundle error:', error);
    res.status(500).json({ error: 'Failed to create bundle' });
  }
};

export const getBundles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const bundles = await database.all(
      'SELECT * FROM bundles WHERE shop_domain = ? ORDER BY created_at DESC',
      [req.shop.shop_domain]
    );

    const formattedBundles: Bundle[] = bundles.map((bundle: any) => ({
      ...bundle,
      items: JSON.parse(bundle.items)
    }));

    res.json(formattedBundles);
  } catch (error) {
    console.error('Get bundles error:', error);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
};

export const getBundle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const { id } = req.params;

    const bundle = await database.get(
      'SELECT * FROM bundles WHERE id = ? AND shop_domain = ?',
      [id, req.shop.shop_domain]
    );

    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    const formattedBundle: Bundle = {
      ...bundle,
      items: JSON.parse(bundle.items)
    };

    // Track bundle view
    await database.run(
      'INSERT INTO bundle_analytics (bundle_id, action) VALUES (?, ?)',
      [id, 'view']
    );

    res.json(formattedBundle);
  } catch (error) {
    console.error('Get bundle error:', error);
    res.status(500).json({ error: 'Failed to fetch bundle' });
  }
};

export const updateBundle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const { id } = req.params;
    const bundleData: Partial<CreateBundleRequest> = req.body;

    // Check if bundle exists and belongs to shop
    const existingBundle = await database.get(
      'SELECT * FROM bundles WHERE id = ? AND shop_domain = ?',
      [id, req.shop.shop_domain]
    );

    if (!existingBundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    // Update bundle
    const updateFields = [];
    const updateValues = [];

    if (bundleData.title) {
      updateFields.push('title = ?');
      updateValues.push(bundleData.title);
    }
    if (bundleData.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(bundleData.description);
    }
    if (bundleData.cover_image_url !== undefined) {
      updateFields.push('cover_image_url = ?');
      updateValues.push(bundleData.cover_image_url);
    }
    if (bundleData.discount_type) {
      updateFields.push('discount_type = ?');
      updateValues.push(bundleData.discount_type);
    }
    if (bundleData.discount_value !== undefined) {
      updateFields.push('discount_value = ?');
      updateValues.push(bundleData.discount_value);
    }
    if (bundleData.items) {
      updateFields.push('items = ?');
      updateValues.push(JSON.stringify(bundleData.items));
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    await database.run(
      `UPDATE bundles SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated bundle
    const updatedBundle = await database.get(
      'SELECT * FROM bundles WHERE id = ?',
      [id]
    );

    const formattedBundle: Bundle = {
      ...updatedBundle,
      items: JSON.parse(updatedBundle.items)
    };

    res.json(formattedBundle);
  } catch (error) {
    console.error('Update bundle error:', error);
    res.status(500).json({ error: 'Failed to update bundle' });
  }
};

export const deleteBundle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const { id } = req.params;

    // Check if bundle exists and belongs to shop
    const bundle = await database.get(
      'SELECT * FROM bundles WHERE id = ? AND shop_domain = ?',
      [id, req.shop.shop_domain]
    );

    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    // Delete bundle analytics first
    await database.run('DELETE FROM bundle_analytics WHERE bundle_id = ?', [id]);
    
    // Delete bundle
    await database.run('DELETE FROM bundles WHERE id = ?', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Delete bundle error:', error);
    res.status(500).json({ error: 'Failed to delete bundle' });
  }
};

