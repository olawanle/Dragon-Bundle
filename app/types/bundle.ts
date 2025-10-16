export interface Product {
  id: string;
  title: string;
  description?: string;
  images: { url: string }[];
  variants: {
    id: string;
    title: string;
    price: string;
    inventoryQuantity: number;
    availableForSale: boolean;
  }[];
}

export interface BundleItem {
  product: Product;
  variant: Product['variants'][0];
  quantity: number;
}

export interface Bundle {
  id: string;
  shop_domain: string;
  title: string;
  description?: string;
  cover_image_url?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  items: BundleItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  stats?: {
    views: number;
    uses: number;
    saves: number;
  };
}

export interface BundleFormData {
  title: string;
  description?: string;
  cover_image_url?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
  }[];
}

export interface VolumeDiscountTier {
  quantity: number;
  discount_percentage: number;
}

export interface BuyXGetYRule {
  trigger_product_id: string;
  trigger_quantity: number;
  reward_product_id: string;
  reward_quantity: number;
  reward_discount_percentage: number;
}
