# 🎨 Render Deployment Guide for Dragon Bundle

## Prerequisites
- Render account (free tier works)
- GitHub repository with your code
- Shopify Partner account

## Step 1: Deploy to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign in with your GitHub account
3. Authorize Render to access your repositories

### 1.2 Deploy Your App
1. Click "New +" in the dashboard
2. Select "Web Service"
3. Connect your GitHub repository
4. Choose your `Dragon-Bundle` repository
5. Render will auto-detect Node.js configuration

## Step 2: Configure Service Settings

### 2.1 Basic Settings
- **Name:** `dragon-bundle`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Root Directory:** `dragon-bundle-2-0`

### 2.2 Build & Deploy Settings
- **Build Command:** `npm install && npm run build && npm run setup`
- **Start Command:** `npm start`
- **Health Check Path:** `/health`

### 2.3 Plan Selection
- **Free Plan:** Perfect for development and testing
- **Starter Plan:** $7/month for production use
- **Professional Plan:** $25/month for high traffic

## Step 3: Configure Environment Variables

In your Render service dashboard, go to Environment tab and add:

```
NODE_ENV=production
SHOPIFY_API_KEY=796344ed84595f62e30b50fa52b5df8c
SHOPIFY_API_SECRET=ceb219a584b37e1cba341926a013a4b6
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
SHOPIFY_APP_URL=https://your-app-name.onrender.com
DATABASE_URL=file:./dev.sqlite
JWT_SECRET=generate_a_secure_random_string_here
```

**Important:** Replace `your-app-name.onrender.com` with your actual Render domain after deployment.

## Step 4: Update Shopify App Configuration

### 4.1 Get Your Render URL
1. After deployment, Render will give you a URL like: `https://dragon-bundle.onrender.com`
2. Copy this URL

### 4.2 Update Shopify Partner Dashboard
1. Go to your Shopify Partner Dashboard
2. Find your "Dragon Bundle 2.0" app
3. Update the App URL to your Render URL
4. Update the Allowed redirection URLs to include:
   - `https://your-render-url.onrender.com/auth/callback`
   - `https://your-render-url.onrender.com/auth/shopify/callback`
   - `https://your-render-url.onrender.com/api/auth/callback`

## Step 5: Test Your Deployment

1. Visit your Render URL
2. Check the health endpoint: `https://your-url.onrender.com/health`
3. Install the app on your test store
4. Test bundle creation and management
5. Verify all functionality works

## Render Advantages

✅ **Full Node.js Support** - Perfect for Shopify apps  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Database Support** - SQLite works out of the box  
✅ **Environment Variables** - Easy configuration  
✅ **Auto Deployments** - Deploys on every Git push  
✅ **Persistent Storage** - Files persist between deployments  
✅ **Custom Domains** - Add your own domain later  
✅ **Health Monitoring** - Built-in health checks  
✅ **Free Tier Available** - Great for development  

## Render vs Other Platforms

| Feature | Render | Railway | Vercel |
|---------|--------|---------|--------|
| Node.js Support | ✅ Full | ✅ Full | ⚠️ Serverless |
| Database | ✅ SQLite/PostgreSQL | ✅ SQLite/PostgreSQL | ❌ External only |
| Free Tier | ✅ Yes | ✅ Yes | ✅ Yes |
| Custom Domains | ✅ Yes | ✅ Yes | ✅ Yes |
| Webhooks | ✅ Yes | ✅ Yes | ⚠️ Limited |
| Shopify Apps | ✅ Perfect | ✅ Perfect | ❌ Not suitable |

## Troubleshooting

### Common Issues:

1. **Build Fails:** Check that all dependencies are in package.json
2. **Database Issues:** Ensure DATABASE_URL is set correctly
3. **API Errors:** Verify all Shopify environment variables are correct
4. **App Not Loading:** Check Render logs for error messages
5. **Health Check Fails:** Ensure `/health` endpoint is accessible

### Render Logs:
- Go to your Render service dashboard
- Click on "Logs" tab
- Check the logs for any errors during build or runtime

### Free Tier Limitations:
- **Sleep Mode:** Free services sleep after 15 minutes of inactivity
- **Cold Starts:** First request after sleep may take 30+ seconds
- **Bandwidth:** 100GB/month included
- **Build Time:** 90 minutes/month included

## Production Checklist

- [ ] Environment variables set in Render
- [ ] Shopify app URLs updated
- [ ] App tested on Shopify store
- [ ] Database migrations applied
- [ ] Health check endpoint working
- [ ] Custom domain configured (optional)
- [ ] Upgrade to paid plan for production (recommended)

## Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Test locally with production environment
4. Check Shopify Partner Dashboard for app status
5. Contact Render support for platform issues

---

**Render is an excellent choice for Shopify apps!** 🎨✨
