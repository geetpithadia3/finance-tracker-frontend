# Frontend Render Deployment Guide

## Frontend Service Setup

### 1. Environment Variables (Set in Render Dashboard)

**🌐 API Configuration:**
```bash
VITE_API_BASE_URL=https://your-backend-service-name.onrender.com
```

### 2. Render Service Configuration

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run preview
```

**Publish Directory:** `dist`

**Environment:** `Node`

### 3. Build Settings

**Root Directory:** `financetracker-frontend`

**Auto-Deploy:** Yes (from main branch)

### 4. Post-Deployment Steps

1. **Get your backend URL** from Render (e.g., `https://finance-tracker-api-xyz.onrender.com`)
2. **Update environment variable:**
   ```bash
   VITE_API_BASE_URL=https://your-actual-backend-url.onrender.com
   ```
3. **Update backend CORS settings** to include your frontend URL
4. **Test the application** end-to-end

### 5. Backend CORS Update

Once you have your frontend URL, update your backend's environment variables:

```bash
ALLOWED_ORIGINS=https://your-frontend-app.onrender.com,http://localhost:3000,http://localhost:5173
```

### 6. Common Issues & Solutions

**Issue: CORS Error**
```
Access to fetch at 'backend-url' from origin 'frontend-url' has been blocked
```
**Solution:** Ensure backend ALLOWED_ORIGINS includes your frontend URL

**Issue: API Connection Failed**
```
Network Error: Failed to fetch
```
**Solution:** Check VITE_API_BASE_URL is set correctly

**Issue: 404 on Page Refresh**
```
Cannot GET /dashboard
```
**Solution:** Add `_redirects` file (already exists) with `/* /index.html 200`

### 7. Verification Checklist

- [ ] Frontend deploys successfully
- [ ] Backend CORS includes frontend URL
- [ ] Login/logout works
- [ ] API calls succeed
- [ ] Page refreshes work correctly
- [ ] All routes are accessible

### 8. Production URLs

After successful deployment:
- Frontend: `https://your-frontend-service-name.onrender.com`
- Backend: `https://your-backend-service-name.onrender.com`
- API Docs: `https://your-backend-service-name.onrender.com/docs`

Make sure both services are connected properly for full functionality.