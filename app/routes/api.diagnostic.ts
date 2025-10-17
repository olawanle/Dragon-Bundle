import { type LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Dragon Bundle",
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.SHOPIFY_API_KEY,
      hasApiSecret: !!process.env.SHOPIFY_API_SECRET,
      hasAppUrl: !!process.env.SHOPIFY_APP_URL,
      hasScopes: !!process.env.SCOPES,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
    request: {
      shop: shop || "not-provided",
      host: url.searchParams.get("host") || "not-provided",
      url: request.url,
    },
    headers: {
      "Content-Security-Policy": `frame-ancestors https://admin.shopify.com https://*.myshopify.com`,
      "X-Frame-Options": "ALLOW-FROM https://admin.shopify.com",
    },
  }, {
    headers: {
      "Content-Security-Policy": "frame-ancestors https://admin.shopify.com https://*.myshopify.com;",
      "X-Frame-Options": "ALLOW-FROM https://admin.shopify.com",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

