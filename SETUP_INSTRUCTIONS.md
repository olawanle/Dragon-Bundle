# 🚀 Dragon Bundle - Setup Instructions

## Issues Fixed:
✅ **Created `.env` file** with required Shopify credentials  
✅ **Improved error handling** to prevent UI crashes  
✅ **Added helpful error messages** for connection issues  

---

## 🔧 Quick Fix Steps:

### 1. **Get Your Shopify API Secret**

The app is currently configured with the API Key, but **you need to add your API Secret**.

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Navigate to **Apps** → Find your **Dragon Bundle** app
3. Click on the app to open its settings
4. Copy the **API Secret Key** (also called Client Secret)

### 2. **Update the `.env` File**

Open the file: `dragon-bundle-2-0/.env`

Find this line:
```env
SHOPIFY_API_SECRET=your_api_secret_here
```

Replace `your_api_secret_here` with your **actual API Secret** from Step 1.

Example:
```env
SHOPIFY_API_SECRET=shpss_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 3. **Install Dependencies (if not already done)**

```powershell
cd dragon-bundle-2-0
npm install
```

### 4. **Set Up the Database**

```powershell
cd dragon-bundle-2-0
npm run setup
```

This will:
- Generate Prisma client
- Create the database schema
- Apply migrations

### 5. **Start the Development Server**

```powershell
cd dragon-bundle-2-0
npm run dev
```

This will start the Shopify CLI development server with ngrok tunneling.

---

## 🎯 What Was Fixed:

### Problem 1: UI Crashing
**Before:** App would crash with no error message when Shopify credentials were missing.  
**After:** App now shows a beautiful error page with clear instructions on how to fix the issue.

### Problem 2: Unable to Connect to admin.shopify.com
**Before:** Generic error with no guidance.  
**After:** The app checks for missing credentials and provides:
- Clear error message
- Step-by-step fix instructions
- Links to relevant documentation

### Problem 3: Missing Environment Variables
**Before:** No `.env` file, causing immediate crashes.  
**After:** Created `.env` file with all required variables (just need to add API Secret).

---

## 🔍 Troubleshooting:

### Still seeing "Unable to Connect to Shopify"?

1. **Check your API Secret:**
   ```powershell
   Get-Content dragon-bundle-2-0\.env | Select-String "SHOPIFY_API_SECRET"
   ```
   Make sure it's not `your_api_secret_here`.

2. **Verify your app URL:**
   - When running `npm run dev`, Shopify CLI will give you a preview URL
   - Make sure this URL matches what's in your Partner Dashboard

3. **Check app scopes:**
   - Go to Partner Dashboard → Your App → Configuration
   - Ensure the scopes match what's in `.env` and `shopify.app.toml`

### Database Issues?

If you see Prisma errors:
```powershell
cd dragon-bundle-2-0
rm dev.sqlite
npm run setup
```

### Port Already in Use?

Kill the process on port 3000:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

---

## 📚 Next Steps:

Once the app is running:

1. **Install on Test Store:**
   - Run `npm run dev`
   - Follow the CLI prompts to install on your development store

2. **Test the Bundle Builder:**
   - Navigate to Create Bundle
   - Add products
   - Set discounts
   - Preview and publish

3. **Check Stats Dashboard:**
   - View bundle performance
   - Track orders and revenue

---

## 🆘 Need More Help?

- Check `REAL_SHOPIFY_SETUP.md` for detailed Shopify configuration
- Visit [Shopify App Development Docs](https://shopify.dev/docs/apps)
- Join [Shopify Community](https://community.shopify.com/c/shopify-community/ct-p/en)

---

## ⚠️ Important Notes:

1. **Never commit your API Secret** to git
2. The `.env` file is already in `.gitignore`
3. For production deployment, use environment variables in your hosting platform
4. Currently configured for Render deployment at: https://dragonbundle.onrender.com

---

## ✅ Checklist:

- [ ] Added API Secret to `.env` file
- [ ] Ran `npm install`
- [ ] Ran `npm run setup` to initialize database
- [ ] Started dev server with `npm run dev`
- [ ] Installed app on test Shopify store
- [ ] Verified app loads without errors

Good luck! 🚀

