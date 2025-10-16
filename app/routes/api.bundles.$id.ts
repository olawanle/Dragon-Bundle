import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import type { BundleFormData } from "../types/bundle";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  try {
    const bundle = await db.bundle.findFirst({
      where: {
        id: params.id,
        shop_domain: session.shop,
      },
    });

    if (!bundle) {
      return json({ error: "Bundle not found" }, { status: 404 });
    }

    return json({ bundle });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return json({ error: "Failed to fetch bundle" }, { status: 500 });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  if (request.method === "PUT") {
    try {
      const bundleData: Partial<BundleFormData> = await request.json();
      
      const bundle = await db.bundle.update({
        where: {
          id: params.id,
        },
        data: {
          ...(bundleData.title && { title: bundleData.title }),
          ...(bundleData.description !== undefined && { description: bundleData.description }),
          ...(bundleData.cover_image_url !== undefined && { cover_image_url: bundleData.cover_image_url }),
          ...(bundleData.discount_type && { discount_type: bundleData.discount_type }),
          ...(bundleData.discount_value !== undefined && { discount_value: bundleData.discount_value }),
          ...(bundleData.items && { items: JSON.stringify(bundleData.items) }),
          updated_at: new Date(),
        },
      });

      return json({ bundle });
    } catch (error) {
      console.error("Error updating bundle:", error);
      return json({ error: "Failed to update bundle" }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    try {
      await db.bundle.delete({
        where: {
          id: params.id,
        },
      });

      return json({ success: true });
    } catch (error) {
      console.error("Error deleting bundle:", error);
      return json({ error: "Failed to delete bundle" }, { status: 500 });
    }
  }

  return json({ error: "Method not allowed" }, { status: 405 });
};
