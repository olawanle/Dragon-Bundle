import { type LoaderFunctionArgs } from "react-router";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return Response.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "Dragon Bundle Shopify App"
  });
};
