export interface BundleItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  title: string;
  variant_title?: string;
  price: string;
  image_url?: string;
}

export interface Bundle {
  id?: number;
  shop_domain: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  items: BundleItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateBundleRequest {
  title: string;
  description?: string;
  cover_image_url?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  items: BundleItem[];
}

export interface BundleAnalytics {
  id?: number;
  bundle_id: number;
  action: 'view' | 'add_to_cart' | 'checkout';
  created_at?: string;
}

