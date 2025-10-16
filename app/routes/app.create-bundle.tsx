import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BundleService } from "../services/bundleService";
import type { BundleFormData, Product, BundleItem } from "../types/bundle";
import { useTheme } from "../contexts/ThemeContext";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const bundleData = JSON.parse(formData.get("bundleData") as string);
      
      const bundle = await BundleService.createBundle(bundleData);
      return Response.json({ success: true, bundle });
    } catch (error) {
      console.error("Error creating bundle:", error);
      return Response.json(
        { error: "Failed to create bundle" },
        { status: 500 }
      );
    }
  }
  
  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

type BundleType = 'fixed' | 'volume' | 'buy_x_get_y';
type Step = 1 | 2 | 3;

export default function CreateBundleScreen() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [bundleType, setBundleType] = useState<BundleType | null>(null);
  const [bundleData, setBundleData] = useState<BundleFormData>({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    items: [],
    is_active: true
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentStep === 2) {
      loadProducts();
    }
  }, [currentStep]);

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
      const newItems = [...bundleData.items];
      newItems[existingItemIndex].quantity += 1;
      setBundleData({ ...bundleData, items: newItems });
    } else {
      const newItem: BundleItem = {
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

  const removeProductFromBundle = (index: number) => {
    const newItems = bundleData.items.filter((_, i) => i !== index);
    setBundleData({ ...bundleData, items: newItems });
  };

  const updateBundleItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromBundle(index);
      return;
    }
    const newItems = [...bundleData.items];
    newItems[index].quantity = quantity;
    setBundleData({ ...bundleData, items: newItems });
  };

  const handleNext = () => {
    if (currentStep === 1 && bundleType) {
      setBundleData({ ...bundleData, discount_type: bundleType });
      setCurrentStep(2);
    } else if (currentStep === 2 && bundleData.items.length > 0) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('bundleData', JSON.stringify(bundleData));
      
      const response = await fetch('/app/create-bundle', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        navigate('/app/home');
      } else {
        setError('Failed to save bundle');
      }
    } catch (err) {
      setError('Failed to save bundle');
    }
  };

  const getBundleTypeInfo = (type: BundleType) => {
    switch (type) {
      case 'fixed':
        return {
          title: 'Fixed Discount',
          description: 'Apply a fixed discount amount to the entire bundle',
          icon: '💰'
        };
      case 'volume':
        return {
          title: 'Volume Discount',
          description: 'Discount based on quantity purchased',
          icon: '📦'
        };
      case 'buy_x_get_y':
        return {
          title: 'Buy X Get Y',
          description: 'Buy a certain quantity, get additional items free',
          icon: '🎁'
        };
    }
  };

  const calculateBundlePricing = () => {
    return BundleService.calculateBundlePricing(bundleData);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background,
      color: colors.text,
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/app/home')}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.primary,
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Back to Home
        </button>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: colors.text 
        }}>
          Create New Bundle
        </h1>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '16px' 
        }}>
          Step {currentStep} of 3
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '40px',
        gap: '8px'
      }}>
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '4px',
              backgroundColor: step <= currentStep ? colors.primary : colors.border,
              borderRadius: '2px',
              transition: 'background-color 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Step 1: Select Bundle Type */}
      {currentStep === 1 && (
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: colors.text 
          }}>
            Choose Bundle Type
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '20px' 
          }}>
            {(['fixed', 'volume', 'buy_x_get_y'] as BundleType[]).map((type) => {
              const info = getBundleTypeInfo(type);
              const isSelected = bundleType === type;
              return (
                <div
                  key={type}
                  onClick={() => setBundleType(type)}
                  style={{
                    backgroundColor: colors.surface,
                    border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                    borderRadius: '12px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = colors.primary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = colors.border;
                    }
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {info.icon}
                  </div>
                  <h3 style={{ 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: colors.text 
                  }}>
                    {info.title}
                  </h3>
                  <p style={{ 
                    color: colors.textSecondary,
                    lineHeight: '1.5'
                  }}>
                    {info.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Configure Bundle */}
      {currentStep === 2 && (
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: colors.text 
          }}>
            Configure Your Bundle
          </h2>
          
          {/* Bundle Details Form */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: colors.text 
              }}>
                Bundle Title *
              </label>
              <input
                type="text"
                value={bundleData.title}
                onChange={(e) => setBundleData({ ...bundleData, title: e.target.value })}
                placeholder="Enter bundle title"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background,
                  color: colors.text,
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '500',
                color: colors.text 
              }}>
                Description
              </label>
              <textarea
                value={bundleData.description}
                onChange={(e) => setBundleData({ ...bundleData, description: e.target.value })}
                placeholder="Describe your bundle"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background,
                  color: colors.text,
                  fontSize: '16px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={bundleData.discount_value}
                  onChange={(e) => setBundleData({ ...bundleData, discount_value: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background,
                    color: colors.text,
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  Discount Type
                </label>
                <select
                  value={bundleData.discount_type}
                  onChange={(e) => setBundleData({ ...bundleData, discount_type: e.target.value as 'percentage' | 'fixed' })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background,
                    color: colors.text,
                    fontSize: '16px'
                  }}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: colors.text 
            }}>
              Add Products to Bundle
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background,
                  color: colors.text,
                  fontSize: '16px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: colors.primary,
                  color: colors.background,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Products List */}
            {products.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '12px' 
              }}>
                {products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => addProductToBundle(product)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: colors.text 
                    }}>
                      {product.title}
                    </h4>
                    <p style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary,
                      marginBottom: '8px'
                    }}>
                      {product.variants[0]?.price || 'No price'}
                    </p>
                    <div style={{
                      fontSize: '12px',
                      color: colors.primary,
                      fontWeight: '500'
                    }}>
                      Click to add
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Products */}
          {bundleData.items.length > 0 && (
            <div style={{ 
              backgroundColor: colors.surface,
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${colors.border}`
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px',
                color: colors.text 
              }}>
                Selected Products ({bundleData.items.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bundleData.items.map((item, index) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '500',
                        color: colors.text 
                      }}>
                        Product {index + 1}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: colors.textSecondary 
                      }}>
                        Variant ID: {item.variant_id}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => updateBundleItemQuantity(index, item.quantity - 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.background,
                            color: colors.text,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          -
                        </button>
                        <span style={{ 
                          minWidth: '30px', 
                          textAlign: 'center',
                          color: colors.text 
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateBundleItemQuantity(index, item.quantity + 1)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.background,
                            color: colors.text,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeProductFromBundle(index)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: colors.error,
                          color: colors.background,
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Preview & Save */}
      {currentStep === 3 && (
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: colors.text 
          }}>
            Preview & Save Bundle
          </h2>
          
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: colors.text 
            }}>
              {bundleData.title}
            </h3>
            
            {bundleData.description && (
              <p style={{ 
                color: colors.textSecondary,
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {bundleData.description}
              </p>
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Bundle Type
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  {getBundleTypeInfo(bundleData.discount_type as BundleType).title}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Discount
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.primary 
                }}>
                  {bundleData.discount_type === 'percentage' 
                    ? `${bundleData.discount_value}%` 
                    : `$${bundleData.discount_value}`}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Products
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  {bundleData.items.length} items
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            {bundleData.items.length > 0 && (
              <div style={{ 
                backgroundColor: colors.background,
                borderRadius: '8px',
                padding: '16px',
                border: `1px solid ${colors.border}`
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: colors.text 
                }}>
                  Pricing Preview
                </h4>
                {(() => {
                  const pricing = calculateBundlePricing();
                  return (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: colors.textSecondary,
                          textDecoration: 'line-through'
                        }}>
                          Original: ${pricing.totalPrice.toFixed(2)}
                        </div>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          color: colors.success 
                        }}>
                          Bundle: ${pricing.finalPrice.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: colors.primary 
                      }}>
                        Save ${pricing.savings.toFixed(2)}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: colors.error,
          color: colors.background,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.border}`
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            opacity: currentStep === 1 ? 0.5 : 1
          }}
        >
          Back
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !bundleType) ||
                (currentStep === 2 && bundleData.items.length === 0) ||
                (currentStep === 2 && !bundleData.title.trim())
              }
              style={{
                padding: '12px 24px',
                backgroundColor: colors.primary,
                color: colors.background,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                opacity: (
                  (currentStep === 1 && !bundleType) ||
                  (currentStep === 2 && bundleData.items.length === 0) ||
                  (currentStep === 2 && !bundleData.title.trim())
                ) ? 0.5 : 1
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!bundleData.title.trim() || bundleData.items.length === 0}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.success,
                color: colors.background,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                opacity: (!bundleData.title.trim() || bundleData.items.length === 0) ? 0.5 : 1
              }}
            >
              Save Bundle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
