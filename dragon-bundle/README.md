# Dragon Bundle - Shopify Bundle Creation App

A mobile-first Flutter app that enables Shopify merchants to create and sell product bundles. The app connects to Shopify stores, allows merchants to create bundles with discounts, and provides checkout functionality.

## 🚀 Features

- **Shopify Integration**: Secure OAuth connection to Shopify stores
- **Product Catalog**: Browse and search products from connected stores
- **Bundle Builder**: Create bundles with 2-6 products and custom discounts
- **Bundle Management**: View, edit, and delete created bundles
- **Checkout Integration**: Generate Shopify checkout URLs for bundles
- **Analytics**: Track bundle views and conversions

## 📱 Tech Stack

### Backend
- **Node.js** + **TypeScript**
- **Express.js** for REST API
- **SQLite** for data storage
- **Shopify API** for store integration
- **JWT** for authentication

### Mobile
- **Flutter** (stable channel)
- **Provider** for state management
- **GoRouter** for navigation
- **HTTP** for API communication
- **Secure Storage** for tokens

## 🛠️ Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Flutter** (stable channel)
3. **Shopify Partner Account**
4. **ngrok** (for development)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   SHOPIFY_API_KEY=your_shopify_api_key_here
   SHOPIFY_API_SECRET=your_shopify_api_secret_here
   SHOPIFY_SCOPES=read_products,write_products,read_orders
   SHOPIFY_APP_URL=https://your-ngrok-url.ngrok.io
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   NODE_ENV=development
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Mobile Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install Flutter dependencies:**
   ```bash
   flutter pub get
   ```

3. **Update API base URL in `lib/services/api_service.dart`:**
   ```dart
   static const String _baseUrl = 'https://your-ngrok-url.ngrok.io/api';
   ```

4. **Run the app:**
   ```bash
   flutter run
   ```

### Shopify App Setup

1. **Create a Shopify Partner Account** at [partners.shopify.com](https://partners.shopify.com)

2. **Create a new app** in your partner dashboard

3. **Configure app settings:**
   - **App URL**: `https://your-ngrok-url.ngrok.io`
   - **Allowed redirection URLs**: `https://your-ngrok-url.ngrok.io/api/shop/auth/callback`
   - **Scopes**: `read_products`, `write_products`, `read_orders`

4. **Get your API credentials** and update the `.env` file

### Development with ngrok

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```

3. **Update your Shopify app URL** with the ngrok URL

4. **Update the mobile app API URL** with the ngrok URL

## 📖 API Endpoints

### Authentication
- `GET /api/shop/install?shop=shop.myshopify.com` - Start OAuth flow
- `GET /api/shop/auth/callback` - OAuth callback

### Products
- `GET /api/products` - Get products with pagination
- `GET /api/products/search?q=query` - Search products

### Bundles
- `GET /api/bundles` - Get all bundles
- `POST /api/bundles` - Create new bundle
- `GET /api/bundles/:id` - Get specific bundle
- `PUT /api/bundles/:id` - Update bundle
- `DELETE /api/bundles/:id` - Delete bundle

### Checkout
- `POST /api/checkout/create` - Create checkout from bundle
- `GET /api/checkout/analytics/:bundleId` - Get bundle analytics

## 🎨 UI Screens

The app includes the following screens based on the provided designs:

1. **Splash Screen** - App loading and authentication check
2. **Login Screen** - Shopify store connection
3. **Products Screen** - Browse and search products
4. **Bundle Builder** - Create and edit bundles
5. **My Bundles** - Manage created bundles
6. **Bundle Preview** - Preview bundle before checkout
7. **Settings Screen** - App configuration

## 🔧 Development

### Backend Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Mobile Development
```bash
# Run in debug mode
flutter run

# Build APK
flutter build apk

# Build for iOS (macOS only)
flutter build ios
```

## 🧪 Testing

### Test Shopify Store
1. Create a development store in your Shopify Partner dashboard
2. Add some test products with variants
3. Use the development store for testing the app

### Test Cases
- [ ] Connect Shopify store via OAuth
- [ ] Browse and search products
- [ ] Create bundle with 2-6 products
- [ ] Apply percentage and fixed discounts
- [ ] Generate checkout URL
- [ ] Complete purchase in Shopify checkout

## 📦 Deployment

### Backend Deployment
Deploy to platforms like:
- **Vercel** (recommended for Node.js)
- **Render**
- **Fly.io**
- **Railway**

### Mobile Deployment
- **Android**: Build APK and distribute via Google Play Store
- **iOS**: Build and distribute via App Store Connect

## 🔐 Security Notes

- Never store Shopify access tokens in the mobile app
- Use HTTPS in production
- Implement proper error handling
- Validate all user inputs
- Use environment variables for sensitive data

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the Shopify API documentation
- Review Flutter documentation for mobile development

---

**Happy Bundling! 🐉**

