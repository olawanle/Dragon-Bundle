import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BundleService } from "../services/bundleService";
import type { Bundle } from "../types/bundle";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return Response.json({ bundleId: params.id });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("_action");
  const bundleId = formData.get("bundleId") as string;

  if (action === "create_checkout") {
    try {
      const result = await BundleService.createCheckout(bundleId);
      return Response.json({ success: true, checkout_url: result.checkout_url });
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : "Failed to create checkout" }, { status: 400 });
    }
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
};

export default function BundlePreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

  useEffect(() => {
    if (id) {
      loadBundle(id);
    }
  }, [id]);

  const loadBundle = async (bundleId: string) => {
    setIsLoading(true);
    try {
      const fetchedBundle = await BundleService.getBundle(bundleId);
      setBundle(fetchedBundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bundle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCheckout = async () => {
    if (!bundle) return;

    setIsCreatingCheckout(true);
    try {
      const formData = new FormData();
      formData.append("_action", "create_checkout");
      formData.append("bundleId", bundle.id);

      const response = await fetch(`/app/bundle-preview/${bundle.id}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.Response.json();

      if (result.success) {
        window.open(result.checkout_url, '_blank');
      } else {
        setError(result.error || "Failed to create checkout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create checkout");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading bundle...</div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ color: "#dc3545", marginBottom: "1rem" }}>
          {error || "Bundle not found"}
        </div>
        <button
          onClick={() => navigate("/app/my-bundles")}
          style={{
            background: "#0066cc",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Back to My Bundles
        </button>
      </div>
    );
  }

  const pricing = BundleService.calculateBundlePricing(bundle);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <button 
          onClick={() => navigate("/app/my-bundles")}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#0066cc", 
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "1rem"
          }}
        >
          ← Back to My Bundles
        </button>
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>Bundle Preview</h1>
        <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
          Preview how your bundle will appear to customers
        </p>
      </div>

      {error && (
        <div style={{
          background: "#fee",
          border: "1px solid #fcc",
          color: "#c33",
          padding: "1rem",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden"
      }}>
        {/* Bundle Header */}
        <div style={{ padding: "2rem", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <span style={{
              background: bundle.is_active ? "#28a745" : "#6c757d",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              {bundle.is_active ? "Active Bundle" : "Inactive Bundle"}
            </span>
            <span style={{
              background: "#e8f5e8",
              color: "#28a745",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              {bundle.discount_type === "percentage" ? `${bundle.discount_value}% OFF` : `$${bundle.discount_value} OFF`}
            </span>
          </div>
          
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.75rem", fontWeight: "600" }}>
            {bundle.title}
          </h2>
          
          {bundle.description && (
            <p style={{ color: "#666", margin: "0 0 1.5rem 0", lineHeight: "1.6" }}>
              {bundle.description}
            </p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "0.25rem" }}>
                Original Price
              </div>
              <div style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                textDecoration: "line-through",
                color: "#999"
              }}>
                ${pricing.totalPrice.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "0.25rem" }}>
                You Save
              </div>
              <div style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                color: "#28a745"
              }}>
                ${pricing.savings.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#666", marginBottom: "0.25rem" }}>
                Bundle Price
              </div>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "700", 
                color: "#0066cc"
              }}>
                ${pricing.finalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Bundle Items */}
        <div style={{ padding: "2rem" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem", fontWeight: "600" }}>
            What's Included ({bundle.items.length} items)
          </h3>
          
          <div style={{ display: "grid", gap: "1rem" }}>
            {bundle.items.map((item, index) => {
              const product = item.product;
              const variant = item.variant;
              
              return (
                <div key={`${item.product_id}-${item.variant_id}`} style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "1rem",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  background: "#fafafa"
                }}>
                  <div style={{ marginRight: "1rem", fontSize: "1.25rem", fontWeight: "600", color: "#666" }}>
                    {index + 1}
                  </div>
                  
                  <img
                    src={product.images[0]?.url || ""}
                    alt={product.title}
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginRight: "1rem"
                    }}
                  />
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "600" }}>
                      {product.title}
                    </h4>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "0.5rem" }}>
                      {variant.title}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      Quantity: {item.quantity} • ${variant.price} each
                    </div>
                  </div>
                  
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                      ${(parseFloat(variant.price) * item.quantity).toFixed(2)}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      ${variant.price} × {item.quantity}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          padding: "2rem", 
          borderTop: "1px solid #eee",
          background: "#f8f9fa",
          display: "flex",
          gap: "1rem",
          justifyContent: "center"
        }}>
          <button
            onClick={handleCreateCheckout}
            disabled={isCreatingCheckout || !bundle.is_active}
            style={{
              background: bundle.is_active && !isCreatingCheckout ? "#28a745" : "#6c757d",
              color: "white",
              border: "none",
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: bundle.is_active && !isCreatingCheckout ? "pointer" : "not-allowed",
              minWidth: "200px"
            }}
          >
            {isCreatingCheckout ? "Creating Checkout..." : "Buy This Bundle"}
          </button>
          
          <button
            onClick={() => navigate("/app/my-bundles")}
            style={{
              background: "white",
              color: "#0066cc",
              border: "2px solid #0066cc",
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontSize: "18px",
              fontWeight: "600",
              cursor: "pointer",
              minWidth: "200px"
            }}
          >
            Back to Bundles
          </button>
        </div>
      </div>

      {/* Bundle Stats */}
      {bundle.stats && (
        <div style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1.5rem",
          marginTop: "1rem"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "600" }}>
            Bundle Performance
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#0066cc" }}>
                {bundle.stats.views}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Views</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#28a745" }}>
                {bundle.stats.uses}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Purchases</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#ffc107" }}>
                {bundle.stats.saves}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>Saves</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
