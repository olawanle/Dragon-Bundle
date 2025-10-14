export interface ShopifyProduct {
  id: string;
  title: string;
  descriptionHtml?: string;
  images: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        availableForSale: boolean;
        inventoryQuantity?: number;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    availableForSale: boolean;
    inventoryQuantity?: number;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

export interface ProductsResponse {
  products: Product[];
  hasNextPage: boolean;
  cursor?: string;
}

