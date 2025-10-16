import { type ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { BundleService } from "../services/bundleService";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  
  if (request.method === "POST") {
    try {
      const { bundle_id } = await request.Response.json();
      
      if (!bundle_id) {
        return Response.json({ error: "Bundle ID is required" }, { status: 400 });
      }

      // Get bundle from database
      const bundle = await db.bundle.findFirst({
        where: {
          id: bundle_id,
          shop_domain: session.shop,
          is_active: true,
        },
      });

      if (!bundle) {
        return Response.json({ error: "Bundle not found or inactive" }, { status: 404 });
      }

      const bundleItems = JSON.parse(bundle.items);
      const pricing = BundleService.calculateBundlePricing(bundle);

      // Create checkout using Shopify Admin API
      const checkoutInput = {
        lineItems: bundleItems.map((item: any) => ({
          variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
          quantity: item.quantity,
        })),
        discountApplications: [
          {
            type: "DISCOUNT_CODE",
            code: `BUNDLE_${bundle.id}`,
            value: {
              percentage: bundle.discount_type === "percentage" ? bundle.discount_value : undefined,
              fixedAmount: bundle.discount_type === "fixed" ? bundle.discount_value : undefined,
            },
          },
        ],
      };

      const checkout = await admin.graphql(`
        mutation checkoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            checkout {
              id
              webUrl
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    variant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
            checkoutUserErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          input: checkoutInput,
        },
      });

      const checkoutData = await checkout.Response.json();
      
      if (checkoutData.data?.checkoutCreate?.checkoutUserErrors?.length > 0) {
        return Response.json({ 
          error: checkoutData.data.checkoutCreate.checkoutUserErrors[0].message 
        }, { status: 400 });
      }

      const createdCheckout = checkoutData.data?.checkoutCreate?.checkout;
      
      if (!createdCheckout) {
        return Response.json({ error: "Failed to create checkout" }, { status: 500 });
      }

      // Update bundle stats
      await db.bundle.update({
        where: { id: bundle_id },
        data: {
          stats: JSON.stringify({
            views: (bundle.stats ? JSON.parse(bundle.stats).views : 0) + 1,
            uses: bundle.stats ? JSON.parse(bundle.stats).uses : 0,
            saves: bundle.stats ? JSON.parse(bundle.stats).saves : 0,
          }),
        },
      });

      return Response.json({ 
        checkout_url: createdCheckout.webUrl,
        checkout_id: createdCheckout.id,
        total_price: createdCheckout.totalPrice,
      });
    } catch (error) {
      console.error("Error creating checkout:", error);
      return Response.json({ error: "Failed to create checkout" }, { status: 500 });
    }
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
};
