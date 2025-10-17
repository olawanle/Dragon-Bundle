/**
 * Middleware to add Content Security Policy headers for Shopify embedded apps
 * This fixes the "admin.shopify.com refused to connect" error
 */

export function addSecurityHeaders(request: Request, headers: Headers) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  // Build frame-ancestors directive
  let frameAncestors = "https://admin.shopify.com";
  
  if (shop) {
    // Add the specific shop domain
    frameAncestors += ` https://${shop}`;
    
    // Also add wildcard for myshopify.com domains
    if (shop.endsWith(".myshopify.com")) {
      frameAncestors += " https://*.myshopify.com";
    }
  } else {
    // Fallback to allow all myshopify.com shops
    frameAncestors += " https://*.myshopify.com";
  }
  
  // Set CSP header to allow embedding
  headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${frameAncestors};`
  );
  
  // Additional security headers for embedded apps
  headers.set("X-Frame-Options", "ALLOW-FROM https://admin.shopify.com");
  headers.set("X-Content-Type-Options", "nosniff");
  
  return headers;
}

