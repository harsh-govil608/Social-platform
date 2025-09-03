# Deployment Guide for Social Platform

This guide will help you deploy your social platform to free hosting services that provide public URLs accessible from any system.

## Prerequisites

1. **MongoDB Atlas Account** (Free)
   - Sign up at https://www.mongodb.com/atlas
   - Create a free M0 cluster
   - Get your connection string

2. **Stream Chat Account** (Free)
   - Sign up at https://getstream.io/chat/
   - Get your API Key and Secret

## Step 1: Deploy Backend to Render

1. **Create a Render Account**
   - Sign up at https://render.com

2. **Connect GitHub Repository** (if using Git)
   - Fork/push your code to GitHub
   - Connect your GitHub account to Render

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - If using GitHub: Select your repository
   - If not using GitHub: Use "Deploy from Git URL" or manual deploy

4. **Configure Build Settings**
   - Name: `social-platform-backend`
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

5. **Set Environment Variables**
   ```
   PORT=10000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET_KEY=generate_a_random_32_char_string
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   NODE_ENV=production
   FRONTEND_URL=https://your-app.netlify.app
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your backend URL will be: `https://social-platform-backend.onrender.com`

## Step 2: Deploy Frontend to Netlify

1. **Create a Netlify Account**
   - Sign up at https://www.netlify.com

2. **Prepare Frontend for Deployment**
   - Create `.env` file in frontend folder:
   ```
   VITE_API_URL=https://social-platform-backend.onrender.com/api
   ```

3. **Build Frontend Locally**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **Deploy to Netlify**
   
   **Option A: Drag & Drop**
   - Go to https://app.netlify.com
   - Drag the `frontend/dist` folder to the deployment area
   
   **Option B: CLI Deploy**
   ```bash
   npm install -g netlify-cli
   netlify deploy --dir=dist --prod
   ```
   
   **Option C: GitHub Integration**
   - Connect GitHub repository
   - Set build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`
     - Add environment variable: `VITE_API_URL=https://social-platform-backend.onrender.com/api`

5. **Configure Custom Domain (Optional)**
   - Your app will be at: `https://[your-app-name].netlify.app`

## Step 3: Alternative - Deploy to Vercel (Frontend)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables**
   - In Vercel dashboard, add:
   ```
   VITE_API_URL=https://social-platform-backend.onrender.com/api
   ```

## Step 4: Final Configuration

1. **Update Backend CORS**
   - Add your frontend URL to allowed origins in `backend/src/server.js`
   - Redeploy backend if needed

2. **Test Your Application**
   - Frontend URL: `https://your-app.netlify.app`
   - Backend Health Check: `https://social-platform-backend.onrender.com/api/auth/check`

## Free Tier Limitations

### Render (Backend)
- Spins down after 15 minutes of inactivity
- First request after inactivity takes 30-50 seconds
- 750 hours/month free

### Netlify (Frontend)
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

### MongoDB Atlas
- 512MB storage
- Shared RAM
- Good for development/small apps

## Your Public URLs

After deployment, you'll have:
- **Frontend**: `https://[your-app-name].netlify.app` or `https://[your-app-name].vercel.app`
- **Backend**: `https://[your-app-name].onrender.com`

Share the frontend URL with anyone to access your social platform!

## Quick Deploy Commands

```bash
# Backend (from backend folder)
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
# Then connect to Render

# Frontend (from frontend folder)
npm run build
netlify deploy --dir=dist --prod
# Or drag dist folder to Netlify
```

## Troubleshooting

1. **CORS Issues**: Make sure frontend URL is in backend's allowed origins
2. **Cookie Issues**: Ensure `sameSite` and `secure` flags are properly set for production
3. **MongoDB Connection**: Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
4. **Slow Initial Load**: Normal for free tier - backend needs to "wake up"

## Support

- Render Docs: https://docs.render.com
- Netlify Docs: https://docs.netlify.com
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/