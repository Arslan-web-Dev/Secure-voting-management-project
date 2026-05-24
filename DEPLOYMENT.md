# 🚀 Vercel Deployment Guide

This guide will help you deploy the Secure Online Election Management System to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A [GitHub account](https://github.com/signup)
- Supabase project with environment variables
- Node.js 18+ installed locally

## Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Ensure `.gitignore` is properly configured:**
   ```gitignore
   # Dependencies
   node_modules/
   .pnp
   .pnp.js

   # Testing
   coverage/

   # Production
   dist/
   build/

   # Environment variables
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local

   # IDE
   .vscode/
   .idea/

   # OS
   .DS_Store
   Thumbs.db
   ```

## Step 2: Configure Environment Variables in Vercel

1. **Go to your Vercel Dashboard** and click **"Add New Project"**

2. **Import your GitHub repository**

3. **Configure Project Settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables:**
   Go to **Settings > Environment Variables** and add:
   
   | Name | Value | Environment |
   | :--- | :--- | :--- |
   | `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
   | `VITE_RESEND_API_KEY` | Your Resend API key (optional) | Production, Preview, Development |

   **Example:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxx
   ```

## Step 3: Deploy

1. **Click "Deploy"** to start the deployment process

2. **Wait for deployment** - Vercel will:
   - Install dependencies
   - Run the build command
   - Generate optimized production files
   - Deploy to global CDN

3. **Your site will be live** at a URL like:
   ```
   https://your-project-name.vercel.app
   ```

## Step 4: Configure Custom Domain (Optional)

1. **Go to Project Settings > Domains**

2. **Add your custom domain:**
   - Enter your domain (e.g., `vote.yourdomain.com`)
   - Update DNS records as instructed by Vercel
   - Wait for SSL certificate to be issued

## Step 5: Post-Deployment Checklist

- [ ] Test the live application
- [ ] Verify Supabase connection works
- [ ] Test user authentication flow
- [ ] Check all animations and UI elements load correctly
- [ ] Verify PWA functionality works
- [ ] Test on mobile devices
- [ ] Check console for any errors

## Troubleshooting

### Build Errors

**Error: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Environment variables not working**
- Ensure variables start with `VITE_` prefix
- Check that variables are added in Vercel dashboard
- Redeploy after adding variables

### Runtime Errors

**Supabase connection failed**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Ensure RLS policies are properly configured

**PWA not working**
- Ensure manifest.json is in public folder
- Check that icons exist (icon-192x192.png, icon-512x512.png)
- Verify service worker is registered correctly

## Continuous Deployment

Vercel automatically deploys when you:
- Push to the main branch
- Open a pull request
- Merge a pull request

You can configure deployment branches in **Settings > Git**.

## Production vs Preview Deployments

- **Production:** Deployed from your main branch
- **Preview:** Deployed from pull requests and other branches

Preview deployments are great for testing changes before merging to production.

## Monitoring

- **Analytics:** Vercel provides built-in analytics
- **Logs:** View real-time logs in Vercel dashboard
- **Performance:** Monitor build times and page load speeds
- **Error Tracking:** Consider integrating Sentry for error tracking

## Cost

- **Free Tier:** Includes 100GB bandwidth per month
- **Pro Tier:** $20/month for additional features
- Most small to medium applications fit within the free tier

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/community)
- [GitHub Issues](https://github.com/vercel/vercel/issues)
