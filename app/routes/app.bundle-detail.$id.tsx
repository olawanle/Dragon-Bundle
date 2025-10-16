import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BundleService } from "../services/bundleService";
import type { Bundle } from "../types/bundle";
import { useTheme } from "../contexts/ThemeContext";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return Response.json({ bundleId: params.id });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  if (request.method === "DELETE") {
    try {
      await BundleService.deleteBundle(params.id!);
      return Response.json({ success: true });
    } catch (error) {
      console.error("Error deleting bundle:", error);
      return Response.json(
        { error: "Failed to delete bundle" },
        { status: 500 }
      );
    }
  }
  
  return Response.json({ error: "Method not allowed" }, { status: 405 });
};

export default function BundleDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { colors } = useTheme();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBundle();
    }
  }, [id]);

  const loadBundle = async () => {
    try {
      const fetchedBundle = await BundleService.getBundle(id!);
      setBundle(fetchedBundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bundle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bundle? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/app/bundle-detail/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        navigate('/app/home');
      } else {
        setError('Failed to delete bundle');
      }
    } catch (err) {
      setError('Failed to delete bundle');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/app/edit-bundle/${id}`);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/app/bundle-detail/${id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Bundle link copied to clipboard!');
    });
  };

  const getBundleTypeInfo = (type: string) => {
    switch (type) {
      case 'fixed':
        return { title: 'Fixed Discount', icon: '💰', color: colors.warning };
      case 'volume':
        return { title: 'Volume Discount', icon: '📦', color: colors.primary };
      case 'buy_x_get_y':
        return { title: 'Buy X Get Y', icon: '🎁', color: colors.success };
      default:
        return { title: 'Unknown', icon: '❓', color: colors.textSecondary };
    }
  };

  const formatDiscount = (bundle: Bundle) => {
    if (bundle.discount_type === 'percentage') {
      return `${bundle.discount_value}% OFF`;
    } else {
      return `$${bundle.discount_value} OFF`;
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: colors.background,
        color: colors.text,
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: colors.textSecondary }}>Loading bundle...</div>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: colors.background,
        color: colors.text,
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ marginBottom: '8px', color: colors.text }}>Bundle Not Found</h2>
          <p style={{ color: colors.textSecondary, marginBottom: '20px' }}>
            {error || 'The bundle you\'re looking for doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/app/home')}
            style={{
              padding: '12px 24px',
              backgroundColor: colors.primary,
              color: colors.background,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const bundleTypeInfo = getBundleTypeInfo(bundle.discount_type);
  const pricing = BundleService.calculateBundlePricing(bundle);

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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: colors.text 
            }}>
              {bundle.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: bundleTypeInfo.color,
                color: colors.background,
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <span>{bundleTypeInfo.icon}</span>
                {bundleTypeInfo.title}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: bundle.is_active ? colors.success : colors.error
                }} />
                <span style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary 
                }}>
                  {bundle.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleShare}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                color: colors.primary,
                border: `1px solid ${colors.primary}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📤 Share
            </button>
            <button
              onClick={handleEdit}
              style={{
                padding: '10px 16px',
                backgroundColor: colors.primary,
                color: colors.background,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                padding: '10px 16px',
                backgroundColor: colors.error,
                color: colors.background,
                border: 'none',
                borderRadius: '8px',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: isDeleting ? 0.6 : 1
              }}
            >
              🗑️ {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Main Content */}
        <div>
          {/* Description */}
          {bundle.description && (
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
                marginBottom: '12px',
                color: colors.text 
              }}>
                Description
              </h3>
              <p style={{ 
                color: colors.textSecondary,
                lineHeight: '1.6'
              }}>
                {bundle.description}
              </p>
            </div>
          )}

          {/* Bundle Items */}
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
              marginBottom: '20px',
              color: colors.text 
            }}>
              Bundle Items ({bundle.items.length})
            </h3>
            
            {bundle.items.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: colors.textSecondary 
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p>No products in this bundle</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bundle.items.map((item, index) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: colors.background,
                      borderRadius: '8px',
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '500',
                        color: colors.text,
                        marginBottom: '4px'
                      }}>
                        Product {index + 1}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: colors.textSecondary 
                      }}>
                        Variant ID: {item.variant_id}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: colors.primary 
                    }}>
                      Qty: {item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bundle Logic */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: colors.text 
            }}>
              Discount Logic
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px' 
            }}>
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Discount Type
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  {bundleTypeInfo.title}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Discount Value
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.primary 
                }}>
                  {formatDiscount(bundle)}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Status
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: bundle.is_active ? colors.success : colors.error
                }}>
                  {bundle.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Pricing Summary */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: colors.text 
            }}>
              Pricing Summary
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: colors.textSecondary }}>Original Price:</span>
                <span style={{ 
                  textDecoration: 'line-through',
                  color: colors.textSecondary 
                }}>
                  ${pricing.totalPrice.toFixed(2)}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: colors.textSecondary }}>Discount:</span>
                <span style={{ color: colors.primary }}>
                  -${pricing.savings.toFixed(2)}
                </span>
              </div>
              
              <div style={{ 
                height: '1px',
                backgroundColor: colors.border,
                margin: '8px 0'
              }} />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '16px',
                  fontWeight: '600',
                  color: colors.text 
                }}>
                  Bundle Price:
                </span>
                <span style={{ 
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: colors.success 
                }}>
                  ${pricing.finalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Bundle Stats */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: colors.text 
            }}>
              Bundle Stats
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Created
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  {new Date(bundle.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Last Updated
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  {new Date(bundle.updated_at).toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Bundle ID
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  color: colors.textSecondary,
                  backgroundColor: colors.background,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  wordBreak: 'break-all'
                }}>
                  {bundle.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
