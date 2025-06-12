# Netlify Deployment Guide - Cove Finance Tracker

This guide provides step-by-step instructions for deploying the Cove Finance Tracker frontend to Netlify.

## 🚀 Quick Deployment

### Option 1: Deploy from GitHub (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

3. **Configure Build Settings**
   - **Build command**: `npm run build:prod`
   - **Publish directory**: `dist`
   - **Node version**: `18` (set in netlify.toml)

4. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add the variables from the production section below

5. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `https://random-name.netlify.app`

### Option 2: Manual Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build the project**
   ```bash
   npm run build:prod
   ```

4. **Deploy**
   ```bash
   # For a draft deploy
   netlify deploy --dir=dist
   
   # For production deploy
   netlify deploy --prod --dir=dist
   ```

### Option 3: Drag and Drop Deploy

1. **Build locally**
   ```bash
   npm run build:prod
   ```

2. **Go to Netlify Dashboard**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Drag and drop the `dist` folder to the deploy area

## 🔧 Configuration Files

The repository includes these Netlify-specific configuration files:

### `netlify.toml`
Main configuration file with:
- Build settings and commands
- Redirect rules for SPA routing
- Security headers
- Environment-specific builds
- Cache control policies

### `public/_redirects`
Fallback redirect file for SPA routing (backup to netlify.toml)

### `.env.production`
Production environment variables template

## 🌍 Environment Variables

### Required Environment Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend-url.com` | Your backend API URL |
| `VITE_APP_NAME` | `Cove` | Application name |
| `VITE_NODE_ENV` | `production` | Environment mode |
| `NODE_VERSION` | `18` | Node.js version for build |

### Optional Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEFAULT_THEME` | `system` | Default UI theme |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable analytics tracking |
| `VITE_ANALYTICS_ID` | - | Google Analytics ID |
| `VITE_LOG_LEVEL` | `warn` | Logging level |
| `VITE_CACHE_DURATION_MS` | `600000` | API cache duration |

## 🏗️ Build Configuration

### Build Commands Available

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run build` | Standard build | Development/staging |
| `npm run build:prod` | Production build | Production deployment |
| `npm run build:netlify` | Build with checks | Netlify recommended |

### Build Process

The Netlify build process:

1. **Install dependencies** - `npm ci`
2. **Run prebuild checks** - Type checking and linting
3. **Build application** - Vite production build
4. **Deploy to CDN** - Upload `dist` folder

### Build Settings in Netlify

```toml
[build]
  command = "npm run build:prod"
  publish = "dist"
  environment = { NODE_VERSION = "18" }
```

## 🔒 Security Configuration

### Security Headers

The `netlify.toml` file includes security headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Content Security Policy

A basic CSP is included. Customize based on your needs:

```toml
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://your-api.com;"
```

## 🌐 Custom Domain Setup

### Using a Custom Domain

1. **Purchase a domain** from your preferred registrar
2. **Add domain in Netlify**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain name

3. **Configure DNS**
   - **Option A**: Use Netlify DNS (recommended)
     - Point nameservers to Netlify
   - **Option B**: Use external DNS
     - Add CNAME record: `www.yourdomain.com` → `your-site.netlify.app`
     - Add A record: `yourdomain.com` → `75.2.60.5`

4. **Enable HTTPS**
   - Netlify provides free SSL certificates
   - HTTPS is automatically enabled for custom domains

### Domain Configuration Example

```bash
# DNS Configuration for yourdomain.com
Type    Name    Value
A       @       75.2.60.5
CNAME   www     your-site.netlify.app
```

## 🔄 Continuous Deployment

### Automatic Deployments

Once connected to GitHub, Netlify automatically:

1. **Deploys on push** to main branch
2. **Creates preview deployments** for pull requests
3. **Runs build checks** before deployment
4. **Provides deploy logs** for debugging

### Branch Deployments

Configure different branches for different environments:

```toml
[context.staging]
  command = "npm run build"
  environment = { NODE_ENV = "staging" }

[context.develop]
  command = "npm run build"
  environment = { NODE_ENV = "development" }
```

### Deploy Previews

For every pull request, Netlify creates a preview deployment:
- Unique URL for testing changes
- Same build process as production
- Automatic updates on new commits

## 📊 Performance Optimization

### Netlify-Specific Optimizations

1. **Asset Optimization**
   - Automatic image optimization
   - CSS and JS minification
   - Gzip compression

2. **CDN Distribution**
   - Global CDN for fast loading
   - Edge locations worldwide
   - Automatic cache invalidation

3. **Bundle Analysis**
   ```bash
   npm run analyze
   ```

### Performance Monitoring

Monitor your deployed site:

1. **Netlify Analytics** - Built-in analytics
2. **Lighthouse** - Performance audits
3. **Core Web Vitals** - Google performance metrics

## 🔧 Advanced Configuration

### Netlify Functions (Optional)

If you need serverless functions:

1. **Create functions directory**
   ```bash
   mkdir netlify/functions
   ```

2. **Add function configuration to netlify.toml**
   ```toml
   [functions]
     directory = "netlify/functions"
     node_bundler = "esbuild"
   ```

3. **Create a function**
   ```javascript
   // netlify/functions/api.js
   exports.handler = async (event, context) => {
     return {
       statusCode: 200,
       body: JSON.stringify({ message: "Hello from Netlify Functions!" })
     };
   };
   ```

### Edge Functions (Advanced)

For advanced edge computing:

```toml
[[edge_functions]]
  function = "auth"
  path = "/dashboard/*"
```

### Form Handling

For contact forms:

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

## 🐛 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs in Netlify dashboard
# Common fixes:
npm run type-check  # Fix TypeScript errors
npm run lint:fix    # Fix ESLint errors
```

**2. Routing Issues**
- Ensure `_redirects` file is in `public/` folder
- Check `netlify.toml` redirect configuration
- Verify React Router is properly configured

**3. Environment Variables Not Working**
- Check variable names start with `VITE_`
- Verify variables are set in Netlify dashboard
- Rebuild and redeploy after adding variables

**4. API Connection Issues**
- Update `VITE_API_BASE_URL` to production backend
- Ensure CORS is configured on backend
- Check network requests in browser dev tools

### Debug Build Issues

1. **Local build test**
   ```bash
   npm run build:prod
   npm run preview
   ```

2. **Check build logs**
   - View detailed logs in Netlify dashboard
   - Look for specific error messages

3. **Environment parity**
   - Ensure local Node version matches Netlify (18)
   - Check package-lock.json is committed

### Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [Netlify Support](https://support.netlify.com/)

## 🚀 Post-Deployment Checklist

After successful deployment:

- [ ] Test all application features
- [ ] Verify API connections work
- [ ] Check responsive design on mobile
- [ ] Test React Router navigation
- [ ] Verify theme switching works
- [ ] Test CSV import functionality
- [ ] Check performance with Lighthouse
- [ ] Set up monitoring/analytics
- [ ] Configure custom domain (if needed)
- [ ] Set up backup/monitoring alerts

## 📈 Monitoring and Analytics

### Built-in Netlify Analytics

Enable in Site settings → Analytics:
- Page views and unique visitors
- Popular pages and referrers
- Bandwidth usage
- Geographic data

### Google Analytics (Optional)

1. Add to environment variables:
   ```
   VITE_ANALYTICS_ID=GA-XXXXXXXXX
   VITE_ENABLE_ANALYTICS=true
   ```

2. Configure in your React app to use the environment variable

### Performance Monitoring

Regular monitoring checklist:
- Monthly Lighthouse audits
- Core Web Vitals tracking
- Error rate monitoring
- User experience metrics

---

## 🎉 Deployment Complete!

Your Cove Finance Tracker is now live on Netlify! 

**Next Steps:**
1. Share your live URL with users
2. Set up monitoring and analytics
3. Plan for future updates and features
4. Monitor performance and user feedback

For ongoing maintenance, see the main README.md and DEVELOPMENT.md files.