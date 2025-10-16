import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useNavigate } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { BundleService } from "../services/bundleService";
import type { Bundle } from "../types/bundle";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  const product = responseJson.data!.productCreate!.product!;
  const variantId = product.variants.edges[0]!.node!.id!;

  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );

  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson!.data!.productCreate!.product,
    variant:
      variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
  };
};

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoadingBundles, setIsLoadingBundles] = useState(true);

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.product?.id) {
      shopify.toast.show("Product created");
    }
  }, [fetcher.data?.product?.id, shopify]);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      const fetchedBundles = await BundleService.getBundles();
      setBundles(fetchedBundles);
    } catch (error) {
      console.error("Failed to load bundles:", error);
    } finally {
      setIsLoadingBundles(false);
    }
  };

  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <s-page heading="Dragon Bundle - Product Bundle Creator">
      <s-button slot="primary-action" onClick={() => navigate("/app/bundle-builder")}>
        Create New Bundle
      </s-button>

      <s-section heading="Welcome to Dragon Bundle 🐉">
        <s-paragraph>
          Create amazing product bundles to increase your sales and customer satisfaction. 
          Combine multiple products with attractive discounts to boost your revenue.
        </s-paragraph>
      </s-section>

      <s-section heading="Quick Actions">
        <s-stack direction="inline" gap="base">
          <s-button onClick={() => navigate("/app/bundle-builder")}>
            Create Bundle
          </s-button>
          <s-button onClick={() => navigate("/app/my-bundles")} variant="secondary">
            View My Bundles
          </s-button>
          <s-button onClick={generateProduct} variant="tertiary">
            Generate Test Product
          </s-button>
        </s-stack>
      </s-section>
      <s-section heading="Recent Bundles">
        {isLoadingBundles ? (
          <s-paragraph>Loading bundles...</s-paragraph>
        ) : bundles.length === 0 ? (
          <s-paragraph>
            No bundles created yet. Create your first bundle to get started!
          </s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {bundles.slice(0, 3).map((bundle) => {
              const pricing = BundleService.calculateBundlePricing(bundle);
              return (
                <s-box
                  key={bundle.id}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                  background="subdued"
                >
                  <s-stack direction="inline" gap="base" align="space-between">
                    <div>
                      <s-heading level={3}>{bundle.title}</s-heading>
                      <s-paragraph>
                        {bundle.items.length} products • {bundle.discount_type === "percentage" ? `${bundle.discount_value}%` : `$${bundle.discount_value}`} discount
                      </s-paragraph>
                      <s-paragraph>
                        <s-text variant="subdued">
                          ${pricing.totalPrice.toFixed(2)} → ${pricing.finalPrice.toFixed(2)} (Save ${pricing.savings.toFixed(2)})
                        </s-text>
                      </s-paragraph>
                    </div>
                    <s-stack direction="inline" gap="tight">
                      <s-button
                        onClick={() => navigate(`/app/bundle-preview/${bundle.id}`)}
                        variant="tertiary"
                        size="slim"
                      >
                        Preview
                      </s-button>
                      <s-button
                        onClick={() => navigate("/app/my-bundles")}
                        variant="tertiary"
                        size="slim"
                      >
                        Manage
                      </s-button>
                    </s-stack>
                  </s-stack>
                </s-box>
              );
            })}
            {bundles.length > 3 && (
              <s-button onClick={() => navigate("/app/my-bundles")} variant="tertiary">
                View All Bundles ({bundles.length})
              </s-button>
            )}
          </s-stack>
        )}
      </s-section>

      <s-section heading="Test Product Generation">
        <s-paragraph>
          Generate a test product to use in your bundles. This helps you test the bundle creation process.
        </s-paragraph>
        <s-stack direction="inline" gap="base">
          <s-button
            onClick={generateProduct}
            {...(isLoading ? { loading: true } : {})}
          >
            Generate Test Product
          </s-button>
          {fetcher.data?.product && (
            <s-button
              onClick={() => {
                shopify.intents.invoke?.("edit:shopify/Product", {
                  value: fetcher.data?.product?.id,
                });
              }}
              target="_blank"
              variant="tertiary"
            >
              Edit Product
            </s-button>
          )}
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="App template specs">
        <s-paragraph>
          <s-text>Framework: </s-text>
          <s-link href="https://reactrouter.com/" target="_blank">
            React Router
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Interface: </s-text>
          <s-link
            href="https://shopify.dev/docs/api/app-home/using-polaris-components"
            target="_blank"
          >
            Polaris web components
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>API: </s-text>
          <s-link
            href="https://shopify.dev/docs/api/admin-graphql"
            target="_blank"
          >
            GraphQL
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Database: </s-text>
          <s-link href="https://www.prisma.io/" target="_blank">
            Prisma
          </s-link>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Next steps">
        <s-unordered-list>
          <s-list-item>
            Build an{" "}
            <s-link
              href="https://shopify.dev/docs/apps/getting-started/build-app-example"
              target="_blank"
            >
              example app
            </s-link>
          </s-list-item>
          <s-list-item>
            Explore Shopify&apos;s API with{" "}
            <s-link
              href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
              target="_blank"
            >
              GraphiQL
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
