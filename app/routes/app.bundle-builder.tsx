import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BundleService } from "~/services/bundleService";
import type { BundleFormData, Product, BundleItem } from "~/types/bundle";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "create") {
    const bundleData: BundleFormData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      discount_type: formData.get("discount_type") as "percentage" | "fixed",
      discount_value: parseFloat(formData.get("discount_value") as string),
      items: JSON.parse(formData.get("items") as string),
    };

    try {
      const bundle = await BundleService.createBundle(bundleData);
      return json({ success: true, bundle });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Failed to create bundle" }, { status: 400 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export default function BundleBuilder() {
  const navigate = useNavigate();
  const [bundleData, setBundleData] = useState<BundleFormData>({
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    items: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (query = "") => {
    setIsLoading(true);
    try {
      const fetchedProducts = await BundleService.getProducts(query);
      setProducts(fetchedProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts(searchQuery);
  };

  const addProductToBundle = (product: Product) => {
    const variant = product.variants[0];
    if (!variant) return;

    const existingItemIndex = bundleData.items.findIndex(
      item => item.product_id === product.id && item.variant_id === variant.id
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newItems = [...bundleData.items];
      newItems[existingItemIndex].quantity += 1;
      setBundleData({ ...bundleData, items: newItems });
    } else {
      // Add new item
      const newItem = {
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
      };
      setBundleData({
        ...bundleData,
        items: [...bundleData.items, newItem],
      });
    }
  };

  const removeProductFromBundle = (productId: string, variantId: string) => {
    const newItems = bundleData.items.filter(
      item => !(item.product_id === productId && item.variant_id === variantId)
    );
    setBundleData({ ...bundleData, items: newItems });
  };

  const updateItemQuantity = (productId: string, variantId: string, quantity: number) => {
    const newItems = bundleData.items.map(item => {
      if (item.product_id === productId && item.variant_id === variantId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    setBundleData({ ...bundleData, items: newItems });
  };

  const calculateTotalPrice = () => {
    return bundleData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      const variant = product?.variants.find(v => v.id === item.variant_id);
      return total + (parseFloat(variant?.price || "0") * item.quantity);
    }, 0);
  };

  const calculateDiscountedPrice = () => {
    const total = calculateTotalPrice();
    const discount = bundleData.discount_type === "percentage"
      ? total * (bundleData.discount_value / 100)
      : bundleData.discount_value;
    return Math.max(0, total - discount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bundleData.items.length < 2) {
      setError("A bundle must contain at least 2 products");
      return;
    }

    if (!bundleData.title.trim()) {
      setError("Bundle title is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("_action", "create");
      formData.append("title", bundleData.title);
      formData.append("description", bundleData.description || "");
      formData.append("discount_type", bundleData.discount_type);
      formData.append("discount_value", bundleData.discount_value.toString());
      formData.append("items", JSON.stringify(bundleData.items));

      const response = await fetch("/app/bundle-builder", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        navigate("/app/my-bundles");
      } else {
        setError(result.error || "Failed to create bundle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bundle");
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
        <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "bold" }}>Bundle Builder</h1>
        <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
          Create amazing product bundles to increase your sales
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Bundle Configuration */}
        <div>
          <div style={{
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem",
            marginBottom: "1rem"
          }}>
            <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Bundle Details</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Bundle Title *
                </label>
                <input
                  type="text"
                  value={bundleData.title}
                  onChange={(e) => setBundleData({ ...bundleData, title: e.target.value })}
                  placeholder="Enter bundle title..."
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Description
                </label>
                <textarea
                  value={bundleData.description}
                  onChange={(e) => setBundleData({ ...bundleData, description: e.target.value })}
                  placeholder="Describe your bundle..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    resize: "vertical"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Discount Type
                  </label>
                  <select
                    value={bundleData.discount_type}
                    onChange={(e) => setBundleData({ 
                      ...bundleData, 
                      discount_type: e.target.value as "percentage" | "fixed" 
                    })}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    {bundleData.discount_type === "percentage" ? "Discount %" : "Discount Amount ($)"}
                  </label>
                  <input
                    type="number"
                    value={bundleData.discount_value}
                    onChange={(e) => setBundleData({ 
                      ...bundleData, 
                      discount_value: parseFloat(e.target.value) || 0 
                    })}
                    min="0"
                    step={bundleData.discount_type === "percentage" ? "1" : "0.01"}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px"
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bundleData.items.length < 2 || !bundleData.title.trim()}
                style={{
                  width: "100%",
                  background: bundleData.items.length >= 2 && bundleData.title.trim() ? "#0066cc" : "#ccc",
                  color: "white",
                  border: "none",
                  padding: "0.75rem",
                  borderRadius: "4px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: bundleData.items.length >= 2 && bundleData.title.trim() ? "pointer" : "not-allowed"
                }}
              >
                Create Bundle
              </button>
            </form>
          </div>

          {/* Bundle Items */}
          <div style={{
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
              Bundle Items ({bundleData.items.length}/6)
            </h3>
            
            {bundleData.items.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>
                No products in bundle yet. Add at least 2 products to create a bundle.
              </p>
            ) : (
              <div>
                {bundleData.items.map((item, index) => {
                  const product = products.find(p => p.id === item.product_id);
                  const variant = product?.variants.find(v => v.id === item.variant_id);
                  
                  if (!product || !variant) return null;

                  return (
                    <div key={`${item.product_id}-${item.variant_id}`} style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "1rem",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      marginBottom: "0.5rem"
                    }}>
                      <img
                        src={product.images[0]?.url || ""}
                        alt={product.title}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "1rem"
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                          {product.title}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          {variant.title} - ${variant.price}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(
                            item.product_id, 
                            item.variant_id, 
                            parseInt(e.target.value) || 1
                          )}
                          min="1"
                          max="10"
                          style={{
                            width: "60px",
                            padding: "0.25rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textAlign: "center"
                          }}
                        />
                        <button
                          onClick={() => removeProductFromBundle(item.product_id, item.variant_id)}
                          style={{
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Product Selection */}
        <div>
          <div style={{
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1.5rem"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Add Products</h3>
            
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  background: "#0066cc",
                  color: "white",
                  border: "none",
                  padding: "0.75rem 1rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Search
              </button>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div>Loading products...</div>
              </div>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {products.map((product) => {
                  const variant = product.variants[0];
                  if (!variant) return null;

                  const isInBundle = bundleData.items.some(
                    item => item.product_id === product.id && item.variant_id === variant.id
                  );

                  return (
                    <div key={product.id} style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "1rem",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      marginBottom: "0.5rem"
                    }}>
                      <img
                        src={product.images[0]?.url || ""}
                        alt={product.title}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginRight: "1rem"
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                          {product.title}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>
                          ${variant.price} • {variant.inventoryQuantity} in stock
                        </div>
                      </div>
                      <button
                        onClick={() => addProductToBundle(product)}
                        disabled={isInBundle || !variant.availableForSale}
                        style={{
                          background: isInBundle ? "#28a745" : "#0066cc",
                          color: "white",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "4px",
                          cursor: isInBundle || !variant.availableForSale ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          opacity: isInBundle || !variant.availableForSale ? 0.6 : 1
                        }}
                      >
                        {isInBundle ? "Added" : "Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bundle Summary */}
          {bundleData.items.length > 0 && (
            <div style={{
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1.5rem",
              marginTop: "1rem"
            }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Bundle Summary</h3>
              
              <div style={{ marginBottom: "0.5rem" }}>
                <span>Total Price: </span>
                <span style={{ fontWeight: "500" }}>${calculateTotalPrice().toFixed(2)}</span>
              </div>
              
              <div style={{ marginBottom: "0.5rem" }}>
                <span>Discount ({bundleData.discount_value}{bundleData.discount_type === "percentage" ? "%" : "$"}): </span>
                <span style={{ fontWeight: "500", color: "#28a745" }}>
                  -${(calculateTotalPrice() - calculateDiscountedPrice()).toFixed(2)}
                </span>
              </div>
              
              <div style={{ 
                paddingTop: "0.5rem", 
                borderTop: "1px solid #eee",
                fontSize: "1.1rem",
                fontWeight: "bold"
              }}>
                <span>Final Price: </span>
                <span style={{ color: "#0066cc" }}>${calculateDiscountedPrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
