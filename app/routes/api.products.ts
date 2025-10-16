import { type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    
    // GraphQL query to fetch products
    const response = await admin.graphql(`
      query getProducts($first: Int!, $query: String) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    availableForSale
                    inventoryQuantity
                  }
                }
              }
            }
          }
        }
      }
    `, {
      variables: {
        first: 50,
        query: query ? `title:*${query}*` : undefined
      }
    });

    const responseJson = await response.json();
    const products = responseJson.data?.products?.edges?.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      image: edge.node.images.edges[0]?.node?.url || null,
      variants: edge.node.variants.edges.map((variantEdge: any) => ({
        id: variantEdge.node.id,
        title: variantEdge.node.title,
        price: variantEdge.node.price,
        compareAtPrice: variantEdge.node.compareAtPrice,
        availableForSale: variantEdge.node.availableForSale,
        inventoryQuantity: variantEdge.node.inventoryQuantity
      }))
    })) || [];

    return Response.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
};
