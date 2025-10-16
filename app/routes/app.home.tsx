import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { BundleService } from "../services/bundleService";
import type { Bundle } from "../types/bundle";
import { useTheme } from "../contexts/ThemeContext";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

type BundleFilter = 'all' | 'fixed' | 'volume' | 'buy_x_get_y';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [filteredBundles, setFilteredBundles] = useState<Bundle[]>([]);
  const [activeFilter, setActiveFilter] = useState<BundleFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBundles();
  }, []);

  useEffect(() => {
    filterBundles();
  }, [bundles, activeFilter]);

  const loadBundles = async () => {
    try {
      const fetchedBundles = await BundleService.getBundles();
      setBundles(fetchedBundles);
    } catch (error) {
      console.error("Failed to load bundles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBundles = () => {
    if (activeFilter === 'all') {
      setFilteredBundles(bundles);
    } else {
      setFilteredBundles(bundles.filter(bundle => bundle.discount_type === activeFilter));
    }
  };

  const getBundleTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed': return 'Fixed Discount';
      case 'volume': return 'Volume Discount';
      case 'buy_x_get_y': return 'Buy X Get Y';
      default: return 'Unknown';
    }
  };

  const getBundleTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return colors.warning;
      case 'volume': return colors.primary;
      case 'buy_x_get_y': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const formatDiscount = (bundle: Bundle) => {
    if (bundle.discount_type === 'percentage') {
      return `${bundle.discount_value}% OFF`;
    } else {
      return `$${bundle.discount_value} OFF`;
    }
  };

  const filters = [
    { key: 'all' as BundleFilter, label: 'All', count: bundles.length },
    { key: 'fixed' as BundleFilter, label: 'Fixed', count: bundles.filter(b => b.discount_type === 'fixed').length },
    { key: 'volume' as BundleFilter, label: 'Volume', count: bundles.filter(b => b.discount_type === 'volume').length },
    { key: 'buy_x_get_y' as BundleFilter, label: 'Buy X Get Y', count: bundles.filter(b => b.discount_type === 'buy_x_get_y').length },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: colors.background,
      color: colors.text,
      padding: '20px',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          color: colors.text 
        }}>
          Dragon Bundle 🐉
        </h1>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '16px' 
        }}>
          Create amazing product bundles to boost your sales
        </p>
      </div>

      {/* Quick Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `2px solid ${activeFilter === filter.key ? colors.primary : colors.border}`,
              backgroundColor: activeFilter === filter.key ? colors.primary : 'transparent',
              color: activeFilter === filter.key ? colors.background : colors.text,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {filter.label}
            <span style={{
              backgroundColor: activeFilter === filter.key ? colors.background : colors.primary,
              color: activeFilter === filter.key ? colors.primary : colors.background,
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '12px',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Bundles Grid */}
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px' 
        }}>
          <div style={{ color: colors.textSecondary }}>Loading bundles...</div>
        </div>
      ) : filteredBundles.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: colors.textSecondary 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ marginBottom: '8px', color: colors.text }}>No bundles found</h3>
          <p>Create your first bundle to get started!</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '100px' // Space for floating button
        }}>
          {filteredBundles.map(bundle => {
            const pricing = BundleService.calculateBundlePricing(bundle);
            return (
              <div
                key={bundle.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${colors.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onClick={() => navigate(`/app/bundle-detail/${bundle.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                {/* Bundle Type Badge */}
                <div style={{
                  display: 'inline-block',
                  backgroundColor: getBundleTypeColor(bundle.discount_type),
                  color: colors.background,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  {getBundleTypeLabel(bundle.discount_type)}
                </div>

                {/* Bundle Title */}
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  color: colors.text 
                }}>
                  {bundle.title}
                </h3>

                {/* Bundle Description */}
                {bundle.description && (
                  <p style={{ 
                    color: colors.textSecondary, 
                    fontSize: '14px', 
                    marginBottom: '16px',
                    lineHeight: '1.4'
                  }}>
                    {bundle.description}
                  </p>
                )}

                {/* Bundle Stats */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      color: colors.primary 
                    }}>
                      {formatDiscount(bundle)}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: colors.textSecondary 
                    }}>
                      {bundle.items.length} products
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: colors.textSecondary,
                      textDecoration: 'line-through'
                    }}>
                      ${pricing.totalPrice.toFixed(2)}
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: colors.success 
                    }}>
                      ${pricing.finalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Bundle Status */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: `1px solid ${colors.border}`
                }}>
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
                      fontSize: '12px', 
                      color: colors.textSecondary 
                    }}>
                      {bundle.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/bundle-detail/${bundle.id}`);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${colors.primary}`,
                      color: colors.primary,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary;
                      e.currentTarget.style.color = colors.background;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = colors.primary;
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating + Button */}
      <button
        onClick={() => navigate('/app/create-bundle')}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: colors.primary,
          color: colors.background,
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
        }}
      >
        +
      </button>
    </div>
  );
}
