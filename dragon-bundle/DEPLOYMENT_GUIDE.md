# 🚀 Dragon Bundle - Deployment Guide

## 📋 Prerequisites

1. **Shopify Partner Account** - https://partners.shopify.com
2. **GitHub Account** (for deployment)
3. **Domain name** (optional, can use provided URLs)

## 🎯 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/dragon-bundle.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Connect your GitHub account
   - Import your repository
   - Deploy automatically

3. **Get your Vercel URL**: `https://your-app-name.vercel.app`

### Option 2: Deploy to Render

1. **Push to GitHub** (same as above)

2. **Deploy to Render**:
   - Go to https://render.com
   - Connect GitHub
   - Create new Web Service
   - Select your repository
   - Use the `render.yaml` configuration

3. **Get your Render URL**: `https://your-app-name.onrender.com`

### Option 3: Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

## 🔧 Shopify App Configuration

### 1. Create Shopify App

1. Go to https://partners.shopify.com
2. Click "Apps" → "Create app"
3. Choose "Custom app" or "Public app"

### 2. Configure App Settings

**App Information:**
- **App name**: Dragon Bundle
- **App URL**: `https://your-deployed-url.com`
- **Allowed redirection URLs**: `https://your-deployed-url.com/api/shop/auth/callback`

**Scopes:**
- `read_products`
- `write_products`
- `read_orders`

### 3. Get API Credentials

After creating the app, you'll get:
- **API key** (Client ID)
- **API secret key** (Client Secret)

### 4. Update Environment Variables

In your deployment platform, add these environment variables:

```env
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders
SHOPIFY_APP_URL=https://your-deployed-url.com
NODE_ENV=production
```

## 📱 Mobile App Deployment

### 1. Update API URL

In `mobile/lib/services/api_service.dart`, update:
```dart
static const String _baseUrl = 'https://your-deployed-url.com/api';
```

### 2. Build Flutter App

```bash
cd mobile
flutter build apk --release
flutter build ios --release
```

### 3. Distribute

- **Android**: Upload APK to Google Play Store
- **iOS**: Upload to App Store Connect

## 🧪 Testing Your Deployed App

### 1. Test Web Interface
- Visit: `https://your-deployed-url.com`
- Test all API endpoints

### 2. Test Shopify Integration
- Visit: `https://your-deployed-url.com/api/shop/install?shop=your-shop.myshopify.com`
- Complete OAuth flow

### 3. Test Mobile App
- Install on device
- Test complete flow

## 🔐 Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ CORS configured properly
- ✅ Error handling implemented
- ✅ Input validation added

## 📊 Monitoring

### Add Logging
```javascript
// Add to server-production.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Health Monitoring
- Use services like UptimeRobot
- Monitor your deployed URL
- Set up alerts for downtime

## 🚀 Go Live Checklist

- [ ] App deployed and accessible
- [ ] Shopify app created and configured
- [ ] Environment variables set
- [ ] OAuth flow working
- [ ] All API endpoints tested
- [ ] Mobile app built and tested
- [ ] Documentation updated
- [ ] Monitoring set up

## 📞 Support

If you need help with deployment:
1. Check the logs in your deployment platform
2. Test locally first
3. Verify environment variables
4. Check Shopify app configuration

---

**Your Dragon Bundle app is ready for production! 🎉**
