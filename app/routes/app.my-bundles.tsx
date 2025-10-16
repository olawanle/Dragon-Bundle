import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BundleService } from "~/services/bundleService";
import type { Bundle } from "~/types/bundle";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("_action");
  const bundleId = formData.get("bundleId") as string;

  if (action === "delete") {
    try {
      await BundleService.deleteBundle(bundleId);
      return json({ success: true });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Failed to delete bundle" }, { status: 400 });
    }
  }

  if (action === "toggle") {
    try {
      const bundle = await BundleService.getBundle(bundleId);
      const updatedBundle = await BundleService.updateBundle(bundleId, {
        ...bundle,
        is_active: !bundle.is_active
      });
      return json({ success: true, bundle: updatedBundle });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Failed to update bundle" }, { status: 400 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function MyBundles() {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBundles();
  }, []);

  const loadBundles = async () => {
    setIsLoading(true);
    try {
      const fetchedBundles = await BundleService.getBundles();
      setBundles(fetchedBundles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bundles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bundleId: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;

    try {
      const formData = new FormData();
      formData.append("_action", "delete");
      formData.append("bundleId", bundleId);

      const response = await fetch("/app/my-bundles", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setBundles(bundles.filter(b => b.id !== bundleId));
      } else {
        setError(result.error || "Failed to delete bundle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bundle");
    }
  };

  const handleToggleActive = async (bundleId: string) => {
    try {
      const formData = new FormData();
      formData.append("_action", "toggle");
      formData.append("bundleId", bundleId);

      const response = await fetch("/app/my-bundles", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setBundles(bundles.map(b => 
          b.id === bundleId ? { ...b, is_active: !b.is_active } : b
        ));
      } else {
        setError(result.error || "Failed to update bundle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bundle");
    }
  };

  const handleCreateCheckout = async (bundleId: string) => {
    try {
      const result = await BundleService.createCheckout(bundleId);
      window.open(result.checkout_url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create checkout");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <button 
          onClick={() => navigate("/app")}
          style={{ 
            background: "none", 
            border: "none", 
            color: "#0066cc", 
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "1rem"
          }}
        >
          ← Back to Dashboard
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>My Bundles</h1>
            <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
              Manage your product bundles and track their performance
            </p>
          </div>
          <button
            onClick={() => navigate("/app/bundle-builder")}
            style={{
              background: "#0066cc",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Create New Bundle
          </button>
        </div>
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

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div>Loading bundles...</div>
        </div>
      ) : bundles.length === 0 ? (
        <div style={{
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "4rem",
          textAlign: "center"
        }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#666" }}>No bundles yet</h3>
          <p style={{ color: "#666", margin: "0 0 2rem 0" }}>
            Create your first bundle to start increasing your sales
          </p>
          <button
            onClick={() => navigate("/app/bundle-builder")}
            style={{
              background: "#0066cc",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Create Your First Bundle
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {bundles.map((bundle) => {
            const pricing = BundleService.calculateBundlePricing(bundle);
            
            return (
              <div key={bundle.id} style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1.5rem",
                display: "grid",
                gridTemplateColumns: "200px 1fr auto",
                gap: "1.5rem",
                alignItems: "start"
              }}>
                {/* Bundle Image */}
                <div>
                  {bundle.cover_image_url ? (
                    <img
                      src={bundle.cover_image_url}
                      alt={bundle.title}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "4px"
                      }}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      height: "150px",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#666"
                    }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Bundle Details */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600" }}>
                      {bundle.title}
                    </h3>
                    <span style={{
                      background: bundle.is_active ? "#28a745" : "#6c757d",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500"
                    }}>
                      {bundle.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  {bundle.description && (
                    <p style={{ color: "#666", margin: "0 0 1rem 0", lineHeight: "1.5" }}>
                      {bundle.description}
                    </p>
                  )}

                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "14px", color: "#666", marginBottom: "0.25rem" }}>
                      {bundle.items.length} products • {bundle.discount_type === "percentage" ? `${bundle.discount_value}%` : `$${bundle.discount_value}`} discount
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        <span style={{ textDecoration: "line-through" }}>${pricing.totalPrice.toFixed(2)}</span>
                        {" "}→ <span style={{ fontWeight: "600", color: "#0066cc" }}>${pricing.finalPrice.toFixed(2)}</span>
                      </span>
                      <span style={{ 
                        background: "#e8f5e8", 
                        color: "#28a745", 
                        padding: "0.25rem 0.5rem", 
                        borderRadius: "4px", 
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        Save ${pricing.savings.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {bundle.stats && (
                    <div style={{ display: "flex", gap: "1rem", fontSize: "14px", color: "#666" }}>
                      <span>👁 {bundle.stats.views} views</span>
                      <span>🛒 {bundle.stats.uses} uses</span>
                      <span>💾 {bundle.stats.saves} saves</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "120px" }}>
                  <button
                    onClick={() => navigate(`/app/bundle-preview/${bundle.id}`)}
                    style={{
                      background: "#0066cc",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Preview
                  </button>
                  
                  <button
                    onClick={() => handleCreateCheckout(bundle.id)}
                    style={{
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Test Checkout
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(bundle.id)}
                    style={{
                      background: bundle.is_active ? "#ffc107" : "#28a745",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    {bundle.is_active ? "Deactivate" : "Activate"}
                  </button>
                  
                  <button
                    onClick={() => handleDelete(bundle.id)}
                    style={{
                      background: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
