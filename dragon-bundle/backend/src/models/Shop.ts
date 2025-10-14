export interface Shop {
  id?: number;
  shop_domain: string;
  access_token: string;
  scope: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShopInstallData {
  shop_domain: string;
  access_token: string;
  scope: string;
}

