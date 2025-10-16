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

interface BundleStats {
  totalBundles: number;
  activeBundles: number;
  totalViews: number;
  totalUses: number;
  totalSaves: number;
  averageDiscount: number;
  topPerformingBundle: Bundle | null;
  bundleTypeDistribution: {
    fixed: number;
    volume: number;
    buy_x_get_y: number;
  };
  monthlyStats: Array<{
    month: string;
    views: number;
    uses: number;
    saves: number;
  }>;
}

export default function StatsScreen() {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [stats, setStats] = useState<BundleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      const fetchedBundles = await BundleService.getBundles();
      setBundles(fetchedBundles);
      
      // Calculate stats from bundles
      const calculatedStats = calculateStats(fetchedBundles);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (bundles: Bundle[]): BundleStats => {
    const totalBundles = bundles.length;
    const activeBundles = bundles.filter(b => b.is_active).length;
    
    // Mock data for demonstration - in real app, this would come from analytics
    const totalViews = bundles.reduce((sum, bundle) => {
      const mockViews = Math.floor(Math.random() * 1000) + 100;
      return sum + mockViews;
    }, 0);
    
    const totalUses = bundles.reduce((sum, bundle) => {
      const mockUses = Math.floor(Math.random() * 100) + 10;
      return sum + mockUses;
    }, 0);
    
    const totalSaves = bundles.reduce((sum, bundle) => {
      const mockSaves = Math.floor(Math.random() * 50) + 5;
      return sum + mockSaves;
    }, 0);
    
    const averageDiscount = bundles.length > 0 
      ? bundles.reduce((sum, bundle) => sum + bundle.discount_value, 0) / bundles.length
      : 0;
    
    const topPerformingBundle = bundles.length > 0 
      ? bundles.reduce((top, bundle) => {
          const bundleViews = Math.floor(Math.random() * 1000) + 100;
          const topViews = Math.floor(Math.random() * 1000) + 100;
          return bundleViews > topViews ? bundle : top;
        })
      : null;
    
    const bundleTypeDistribution = {
      fixed: bundles.filter(b => b.discount_type === 'fixed').length,
      volume: bundles.filter(b => b.discount_type === 'volume').length,
      buy_x_get_y: bundles.filter(b => b.discount_type === 'buy_x_get_y').length,
    };
    
    // Generate mock monthly stats
    const monthlyStats = generateMonthlyStats(selectedPeriod);
    
    return {
      totalBundles,
      activeBundles,
      totalViews,
      totalUses,
      totalSaves,
      averageDiscount,
      topPerformingBundle,
      bundleTypeDistribution,
      monthlyStats
    };
  };

  const generateMonthlyStats = (period: string) => {
    const months = [];
    const now = new Date();
    
    let monthsCount = 7;
    if (period === '30d') monthsCount = 1;
    else if (period === '90d') monthsCount = 3;
    else if (period === '1y') monthsCount = 12;
    
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        views: Math.floor(Math.random() * 500) + 100,
        uses: Math.floor(Math.random() * 50) + 10,
        saves: Math.floor(Math.random() * 25) + 5,
      });
    }
    
    return months;
  };

  const getBundleTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return colors.warning;
      case 'volume': return colors.primary;
      case 'buy_x_get_y': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const SimpleBarChart = ({ data, color }: { data: Array<{ month: string; value: number }>, color: string }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={{ display: 'flex', alignItems: 'end', gap: '8px', height: '120px' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <div
              style={{
                width: '100%',
                height: `${(item.value / maxValue) * 100}px`,
                backgroundColor: color,
                borderRadius: '4px 4px 0 0',
                minHeight: '4px',
                transition: 'height 0.3s ease'
              }}
            />
            <div style={{ 
              fontSize: '10px', 
              color: colors.textSecondary,
              marginTop: '4px',
              textAlign: 'center'
            }}>
              {item.month}
            </div>
          </div>
        ))}
      </div>
    );
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ color: colors.textSecondary }}>Loading stats...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
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
          <h2 style={{ marginBottom: '8px', color: colors.text }}>No Stats Available</h2>
          <p style={{ color: colors.textSecondary, marginBottom: '20px' }}>
            Create some bundles to see performance metrics
          </p>
          <button
            onClick={() => navigate('/app/create-bundle')}
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
            Create Bundle
          </button>
        </div>
      </div>
    );
  }

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
          Bundle Performance 📊
        </h1>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '16px' 
        }}>
          Track your bundle performance and analytics
        </p>
      </div>

      {/* Period Selector */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: '7d', label: 'Last 7 Days' },
          { key: '30d', label: 'Last 30 Days' },
          { key: '90d', label: 'Last 90 Days' },
          { key: '1y', label: 'Last Year' }
        ].map(period => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `2px solid ${selectedPeriod === period.key ? colors.primary : colors.border}`,
              backgroundColor: selectedPeriod === period.key ? colors.primary : 'transparent',
              color: selectedPeriod === period.key ? colors.background : colors.text,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: colors.text,
            marginBottom: '4px'
          }}>
            {stats.totalBundles}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: colors.textSecondary 
          }}>
            Total Bundles
          </div>
        </div>

        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👁️</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: colors.text,
            marginBottom: '4px'
          }}>
            {stats.totalViews.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: colors.textSecondary 
          }}>
            Total Views
          </div>
        </div>

        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: colors.text,
            marginBottom: '4px'
          }}>
            {stats.totalUses.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: colors.textSecondary 
          }}>
            Total Uses
          </div>
        </div>

        <div style={{
          backgroundColor: colors.surface,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${colors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💾</div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: colors.text,
            marginBottom: '4px'
          }}>
            {stats.totalSaves.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: colors.textSecondary 
          }}>
            Total Saves
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Charts Section */}
        <div>
          {/* Views Chart */}
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
              Views Over Time
            </h3>
            <SimpleBarChart 
              data={stats.monthlyStats.map(stat => ({ month: stat.month, value: stat.views }))}
              color={colors.primary}
            />
          </div>

          {/* Uses Chart */}
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
              Uses Over Time
            </h3>
            <SimpleBarChart 
              data={stats.monthlyStats.map(stat => ({ month: stat.month, value: stat.uses }))}
              color={colors.success}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Bundle Type Distribution */}
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
              Bundle Types
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.entries(stats.bundleTypeDistribution).map(([type, count]) => (
                <div key={type} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getBundleTypeColor(type)
                    }} />
                    <span style={{ 
                      fontSize: '14px', 
                      color: colors.text,
                      textTransform: 'capitalize'
                    }}>
                      {type.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: colors.text 
                  }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Bundle */}
          {stats.topPerformingBundle && (
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
                Top Performer
              </h3>
              
              <div style={{
                backgroundColor: colors.background,
                borderRadius: '8px',
                padding: '16px',
                border: `1px solid ${colors.border}`
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  marginBottom: '8px',
                  color: colors.text 
                }}>
                  {stats.topPerformingBundle.title}
                </h4>
                <p style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '12px'
                }}>
                  {stats.topPerformingBundle.description || 'No description'}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    color: colors.textSecondary 
                  }}>
                    {stats.topPerformingBundle.items.length} products
                  </span>
                  <button
                    onClick={() => navigate(`/app/bundle-detail/${stats.topPerformingBundle!.id}`)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: colors.primary,
                      color: colors.background,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Average Discount */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            marginTop: '20px',
            border: `1px solid ${colors.border}`
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '16px',
              color: colors.text 
            }}>
              Average Discount
            </h3>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: colors.primary,
              textAlign: 'center'
            }}>
              {stats.averageDiscount.toFixed(1)}%
            </div>
            <p style={{ 
              fontSize: '14px', 
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: '8px'
            }}>
              Across all bundles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
