import { Response } from 'express';
import { shopify, CREATE_CHECKOUT_MUTATION } from '../utils/shopify';
import { AuthenticatedRequest } from '../middleware/auth';
import { database } from '../models/database';
import { BundleItem } from '../models/Bundle';

export const createCheckout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const { bundle_id } = req.body;

    if (!bundle_id) {
      return res.status(400).json({ error: 'Bundle ID is required' });
    }

    // Get bundle from database
    const bundle = await database.get(
      'SELECT * FROM bundles WHERE id = ? AND shop_domain = ?',
      [bundle_id, req.shop.shop_domain]
    );

    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    const bundleItems: BundleItem[] = JSON.parse(bundle.items);

    // Create line items for checkout
    const lineItems = bundleItems.map(item => ({
      variantId: item.variant_id,
      quantity: item.quantity,
    }));

    // Calculate discount
    let discountApplications = [];
    if (bundle.discount_type === 'percentage' && bundle.discount_value > 0) {
      discountApplications.push({
        codeDiscount: {
          code: `BUNDLE_${bundle_id}_${bundle.discount_value}%`,
          applicable: true,
        }
      });
    } else if (bundle.discount_type === 'fixed' && bundle.discount_value > 0) {
      // For fixed discounts, we'll need to create a discount code or use draft order
      // For now, we'll add it as a note
      discountApplications.push({
        codeDiscount: {
          code: `BUNDLE_${bundle_id}_$${bundle.discount_value}`,
          applicable: true,
        }
      });
    }

    const client = new shopify.clients.Graphql({
      session: {
        shop: req.shop.shop_domain,
        accessToken: req.shop.access_token,
      },
    });

    const response = await client.query({
      data: {
        query: CREATE_CHECKOUT_MUTATION,
        variables: {
          input: {
            lineItems,
            note: `Bundle: ${bundle.title}`,
            // Add discount if applicable
            ...(discountApplications.length > 0 && {
              discountApplications: discountApplications
            })
          }
        }
      }
    });

    const data = response.body as any;

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return res.status(400).json({ 
        error: 'Failed to create checkout', 
        details: data.errors 
      });
    }

    if (data.data.checkoutCreate.checkoutUserErrors.length > 0) {
      console.error('Checkout user errors:', data.data.checkoutCreate.checkoutUserErrors);
      return res.status(400).json({ 
        error: 'Checkout creation failed', 
        details: data.data.checkoutCreate.checkoutUserErrors 
      });
    }

    const checkout = data.data.checkoutCreate.checkout;

    // Track bundle add to cart
    await database.run(
      'INSERT INTO bundle_analytics (bundle_id, action) VALUES (?, ?)',
      [bundle_id, 'add_to_cart']
    );

    res.json({
      checkout_id: checkout.id,
      checkout_url: checkout.webUrl,
      line_items: checkout.lineItems.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        quantity: edge.node.quantity,
        variant: edge.node.variant
      }))
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
};

export const getBundleAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.shop) {
      return res.status(401).json({ error: 'Shop not authenticated' });
    }

    const { bundle_id } = req.params;

    // Verify bundle belongs to shop
    const bundle = await database.get(
      'SELECT id FROM bundles WHERE id = ? AND shop_domain = ?',
      [bundle_id, req.shop.shop_domain]
    );

    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }

    // Get analytics data
    const analytics = await database.all(
      `SELECT action, COUNT(*) as count, DATE(created_at) as date 
       FROM bundle_analytics 
       WHERE bundle_id = ? 
       GROUP BY action, DATE(created_at) 
       ORDER BY date DESC`,
      [bundle_id]
    );

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

