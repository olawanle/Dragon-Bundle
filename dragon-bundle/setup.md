# Dragon Bundle - Quick Setup Guide

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your Shopify app credentials
npm run dev
```

### 2. Mobile Setup
```bash
cd mobile
flutter pub get
# Update API URL in lib/services/api_service.dart
flutter run
```

### 3. Shopify App Configuration

1. **Create Shopify Partner Account** at [partners.shopify.com](https://partners.shopify.com)
2. **Create a new app** in your partner dashboard
3. **Configure app settings:**
   - App URL: `https://your-ngrok-url.ngrok.io`
   - Allowed redirection URLs: `https://your-ngrok-url.ngrok.io/api/shop/auth/callback`
   - Scopes: `read_products`, `write_products`, `read_orders`

### 4. Environment Variables

Create `.env` file in backend directory:
```env
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders
SHOPIFY_APP_URL=https://your-ngrok-url.ngrok.io
JWT_SECRET=your_jwt_secret_here
PORT=3000
NODE_ENV=development
```

### 5. Development with ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start ngrok tunnel
ngrok http 3000

# Update your Shopify app URL with the ngrok URL
# Update mobile app API URL with the ngrok URL
```

## 📱 App Features Implemented

✅ **Backend (Node.js + TypeScript)**
- Shopify OAuth integration
- REST API endpoints for products, bundles, checkout
- SQLite database with proper schema
- JWT authentication
- Error handling and validation

✅ **Mobile App (Flutter)**
- Splash screen with authentication check
- Login screen with Shopify OAuth
- Products screen with search and pagination
- Bundle builder for creating bundles
- My bundles screen for management
- Bundle preview with checkout integration
- Settings screen with logout functionality
- State management with Provider
- Secure token storage

✅ **UI/UX**
- Modern design based on provided mockups
- Green primary color (#38E07B)
- Manrope font family
- Dark/light theme support
- Responsive layouts
- Loading states and error handling

## 🔧 Next Steps

1. **Install Flutter** if not already installed
2. **Set up Shopify Partner Account**
3. **Configure environment variables**
4. **Test the complete flow:**
   - Connect Shopify store
   - Browse products
   - Create bundle
   - Generate checkout

## 📞 Support

The app is ready for testing! Follow the setup instructions and let me know if you need any adjustments or have questions about the implementation.

