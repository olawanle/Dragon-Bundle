# 🚂 Railway Deployment Guide for Dragon Bundle

## Prerequisites
- Railway account (free tier works)
- GitHub repository with your code
- Shopify Partner account

## Step 1: Deploy to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Authorize Railway to access your repositories

### 1.2 Deploy Your App
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `Dragon-Bundle` repository
4. Railway will automatically detect it's a Node.js app
5. Click "Deploy"

## Step 2: Configure Environment Variables

In your Railway project dashboard, go to Variables tab and add:

```
SHOPIFY_API_KEY=796344ed84595f62e30b50fa52b5df8c
SHOPIFY_API_SECRET=ceb219a584b37e1cba341926a013a4b6
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,write_inventory
SHOPIFY_APP_URL=https://your-app-name.railway.app
DATABASE_URL=file:./dev.sqlite
JWT_SECRET=generate_a_secure_random_string_here
NODE_ENV=production
```

**Important:** Replace `your-app-name.railway.app` with your actual Railway domain after deployment.

## Step 3: Update Shopify App Configuration

### 3.1 Get Your Railway URL
1. After deployment, Railway will give you a URL like: `https://dragon-bundle-production-abc123.up.railway.app`
2. Copy this URL

### 3.2 Update Shopify Partner Dashboard
1. Go to your Shopify Partner Dashboard
2. Find your "Dragon Bundle 2.0" app
3. Update the App URL to your Railway URL
4. Update the Allowed redirection URLs to include:
   - `https://your-railway-url.up.railway.app/auth/callback`
   - `https://your-railway-url.up.railway.app/auth/shopify/callback`
   - `https://your-railway-url.up.railway.app/api/auth/callback`

## Step 4: Test Your Deployment

1. Visit your Railway URL
2. Install the app on your test store
3. Test bundle creation and management
4. Verify all functionality works

## Railway Advantages

✅ **Full Node.js Support** - Perfect for Shopify apps  
✅ **Automatic HTTPS** - SSL certificates included  
✅ **Database Support** - SQLite works out of the box  
✅ **Environment Variables** - Easy configuration  
✅ **Auto Deployments** - Deploys on every Git push  
✅ **Persistent Storage** - Files persist between deployments  
✅ **Custom Domains** - Add your own domain later  

## Troubleshooting

### Common Issues:

1. **Build Fails:** Check that all dependencies are in package.json
2. **Database Issues:** Ensure DATABASE_URL is set correctly
3. **API Errors:** Verify all Shopify environment variables are correct
4. **App Not Loading:** Check Railway logs for error messages

### Railway Logs:
- Go to your Railway project dashboard
- Click on "Deployments" tab
- Click on the latest deployment
- Check the logs for any errors

## Production Checklist

- [ ] Environment variables set in Railway
- [ ] Shopify app URLs updated
- [ ] App tested on Shopify store
- [ ] Database migrations applied
- [ ] Error monitoring set up
- [ ] Custom domain configured (optional)

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test locally with production environment
4. Check Shopify Partner Dashboard for app status

---

**Railway is the perfect platform for Shopify apps!** 🚂✨
