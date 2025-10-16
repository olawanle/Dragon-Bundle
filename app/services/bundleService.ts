import type { Bundle, BundleFormData, Product } from "~/types/bundle";

const API_BASE_URL = '/api';

export class BundleService {
  // Create a new bundle
  static async createBundle(bundleData: BundleFormData): Promise<Bundle> {
    const response = await fetch(`${API_BASE_URL}/bundles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bundleData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create bundle: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all bundles for the current shop
  static async getBundles(): Promise<Bundle[]> {
    const response = await fetch(`${API_BASE_URL}/bundles`);

    if (!response.ok) {
      throw new Error(`Failed to fetch bundles: ${response.statusText}`);
    }

    const data = await response.json();
    return data.bundles || [];
  }

  // Get a specific bundle by ID
  static async getBundle(bundleId: string): Promise<Bundle> {
    const response = await fetch(`${API_BASE_URL}/bundles/${bundleId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch bundle: ${response.statusText}`);
    }

    const data = await response.json();
    return data.bundle;
  }

  // Update a bundle
  static async updateBundle(bundleId: string, bundleData: Partial<BundleFormData>): Promise<Bundle> {
    const response = await fetch(`${API_BASE_URL}/bundles/${bundleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bundleData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update bundle: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete a bundle
  static async deleteBundle(bundleId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/bundles/${bundleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete bundle: ${response.statusText}`);
    }
  }

  // Get products for bundle creation
  static async getProducts(searchQuery?: string): Promise<Product[]> {
    const url = searchQuery 
      ? `${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}`
      : `${API_BASE_URL}/products`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    return data.products || [];
  }

  // Calculate bundle pricing
  static calculateBundlePricing(bundle: Bundle) {
    const totalPrice = bundle.items.reduce(
      (sum, item) => sum + parseFloat(item.variant.price) * item.quantity,
      0
    );

    const discountAmount = bundle.discount_type === 'percentage'
      ? totalPrice * (bundle.discount_value / 100)
      : bundle.discount_value;

    const finalPrice = Math.max(0, totalPrice - discountAmount);
    const savings = totalPrice - finalPrice;

    return {
      totalPrice,
      discountAmount,
      finalPrice,
      savings,
      discountPercentage: bundle.discount_type === 'percentage' 
        ? bundle.discount_value 
        : (discountAmount / totalPrice) * 100
    };
  }

  // Create checkout for bundle
  static async createCheckout(bundleId: string): Promise<{ checkout_url: string }> {
    const response = await fetch(`${API_BASE_URL}/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bundle_id: bundleId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checkout: ${response.statusText}`);
    }

    return response.json();
  }
}
