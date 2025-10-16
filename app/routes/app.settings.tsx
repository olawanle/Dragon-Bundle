import React, { useState } from "react";
import { useNavigate } from "react-router";
import { type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { useTheme } from "../contexts/ThemeContext";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { theme, toggleTheme, colors } = useTheme();
  const [profile, setProfile] = useState({
    name: 'Dragon Bundle User',
    email: 'user@dragonbundle.com',
    shop: 'your-shop.myshopify.com',
    plan: 'Free'
  });
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    bundleAlerts: true,
    performanceReports: false,
    marketingTips: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // In a real app, this would clear the session and redirect to login
      alert('Logged out successfully!');
      navigate('/');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your bundles and data. Are you absolutely sure?')) {
        alert('Account deletion requested. Please contact support.');
      }
    }
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
          Settings ⚙️
        </h1>
        <p style={{ 
          color: colors.textSecondary,
          fontSize: '16px' 
        }}>
          Manage your account and preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Main Settings */}
        <div>
          {/* Profile Settings */}
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
              Profile Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
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

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
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

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  Shopify Store
                </label>
                <input
                  type="text"
                  value={profile.shop}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.textSecondary,
                    fontSize: '16px',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  Current Plan
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background
                }}>
                  <span style={{ 
                    fontSize: '16px',
                    color: colors.text 
                  }}>
                    {profile.plan}
                  </span>
                  <button
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
                    Upgrade
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: colors.primary,
                color: colors.background,
                border: 'none',
                borderRadius: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                opacity: isSaving ? 0.6 : 1
              }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Notification Settings */}
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
              Notification Preferences
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '500',
                      color: colors.text,
                      marginBottom: '4px'
                    }}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: colors.textSecondary 
                    }}>
                      {key === 'emailUpdates' && 'Receive email updates about your bundles'}
                      {key === 'bundleAlerts' && 'Get notified when bundles are used'}
                      {key === 'performanceReports' && 'Weekly performance reports'}
                      {key === 'marketingTips' && 'Tips and best practices for bundle marketing'}
                    </div>
                  </div>
                  <label style={{ 
                    position: 'relative',
                    display: 'inline-block',
                    width: '48px',
                    height: '24px'
                  }}>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: value ? colors.primary : colors.border,
                      borderRadius: '24px',
                      transition: '0.3s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px',
                        width: '18px',
                        left: value ? '26px' : '3px',
                        bottom: '3px',
                        backgroundColor: colors.background,
                        borderRadius: '50%',
                        transition: '0.3s'
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ 
            backgroundColor: colors.surface,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${colors.error}`
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: colors.error 
            }}>
              Danger Zone
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    color: colors.text,
                    marginBottom: '4px'
                  }}>
                    Logout
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: colors.textSecondary 
                  }}>
                    Sign out of your account
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Logout
                </button>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: colors.background,
                borderRadius: '8px',
                border: `1px solid ${colors.border}`
              }}>
                <div>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    color: colors.error,
                    marginBottom: '4px'
                  }}>
                    Delete Account
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: colors.textSecondary 
                  }}>
                    Permanently delete your account and all data
                  </div>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.error,
                    color: colors.background,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Theme Settings */}
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
              Appearance
            </h3>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text,
                  marginBottom: '4px'
                }}>
                  Theme
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary 
                }}>
                  {theme === 'light' ? 'Light (White & Green)' : 'Dark (Black & Green)'}
                </div>
              </div>
              <label style={{ 
                position: 'relative',
                display: 'inline-block',
                width: '48px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: theme === 'dark' ? colors.primary : colors.border,
                  borderRadius: '24px',
                  transition: '0.3s'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: theme === 'dark' ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: colors.background,
                    borderRadius: '50%',
                    transition: '0.3s'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}>
              <div style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: `2px solid ${theme === 'light' ? colors.primary : colors.border}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: '#111827'
              }}>
                Light
              </div>
              <div style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#000000',
                border: `2px solid ${theme === 'dark' ? colors.primary : colors.border}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '500',
                color: '#F9FAFB'
              }}>
                Dark
              </div>
            </div>
          </div>

          {/* App Info */}
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
              About Dragon Bundle
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Version
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.text 
                }}>
                  2.0.0
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
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  color: colors.textSecondary,
                  marginBottom: '4px'
                }}>
                  Support
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '500',
                  color: colors.primary,
                  cursor: 'pointer'
                }}>
                  help@dragonbundle.com
                </div>
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: `1px solid ${colors.border}`
            }}>
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
