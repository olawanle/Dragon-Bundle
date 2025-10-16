import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import type { Bundle, BundleFormData } from "../types/bundle";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const bundles = await db.bundle.findMany({
      where: {
        shop_domain: session.shop,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return Response.json({ bundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return Response.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  if (request.method === "POST") {
    try {
      const bundleData: BundleFormData = await request.Response.json();
      
      // Validate bundle data
      if (!bundleData.title || bundleData.items.length < 2) {
        return Response.json({ error: "Bundle must have a title and at least 2 items" }, { status: 400 });
      }

      // Create bundle
      const bundle = await db.bundle.create({
        data: {
          shop_domain: session.shop,
          title: bundleData.title,
          description: bundleData.description,
          cover_image_url: bundleData.cover_image_url,
          discount_type: bundleData.discount_type,
          discount_value: bundleData.discount_value,
          items: JSON.stringify(bundleData.items),
          is_active: true,
        },
      });

      return Response.json({ bundle });
    } catch (error) {
      console.error("Error creating bundle:", error);
      return Response.json({ error: "Failed to create bundle" }, { status: 500 });
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};
