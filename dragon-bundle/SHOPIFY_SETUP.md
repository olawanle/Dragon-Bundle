# Shopify App Setup Guide

## 🔑 Your Shopify Partner Credentials

You need to create a **Shopify App** in the Partner Dashboard to get the proper OAuth credentials (API key and secret).

## 📋 Required Steps

### 1. Create a Shopify App

1. **Go to your Shopify Partner Dashboard**: https://partners.shopify.com
2. **Click "Apps"** in the left sidebar
3. **Click "Create app"**
4. **Choose "Custom app"** for development
5. **Fill in the details**:
   - App name: Dragon Bundle
   - App URL: `https://your-ngrok-url.ngrok.io`
   - Allowed redirection URLs: `https://your-ngrok-url.ngrok.io/api/shop/auth/callback`

### 2. Configure App Settings

**In your app settings, set:**
- **App URL**: `https://your-ngrok-url.ngrok.io`
- **Allowed redirection URLs**: `https://your-ngrok-url.ngrok.io/api/shop/auth/callback`
- **Scopes**: 
  - `read_products`
  - `write_products` 
  - `read_orders`

### 3. Get Your API Credentials

After creating the app, you'll get:
- **API key** (Client ID)
- **API secret key** (Client Secret)

### 4. Update .env File

Replace the placeholder values in `backend/.env`:

```env
SHOPIFY_API_KEY=your_actual_api_key_here
SHOPIFY_API_SECRET=your_actual_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders
SHOPIFY_APP_URL=https://your-ngrok-url.ngrok.io
JWT_SECRET=dragon_bundle_jwt_secret_2024_secure_key
PORT=3000
NODE_ENV=development
```

### 5. Install ngrok

```bash
# Install ngrok globally
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000
```

### 6. Update URLs

1. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)
2. **Update your Shopify app settings** with the ngrok URL
3. **Update the .env file** with the ngrok URL

## 🚀 Next Steps

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Install Flutter** (if not done yet)

3. **Update mobile app API URL** in `mobile/lib/services/api_service.dart`

4. **Test the complete flow**:
   - Connect Shopify store
   - Browse products
   - Create bundle
   - Generate checkout

## 📞 Need Help?

The access token you provided is a **Partner API token**, not an app API key. You need to create a **Shopify App** to get the proper API credentials for the OAuth flow.

Let me know when you have the API key and secret, and I'll help you complete the setup!

