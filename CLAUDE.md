# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Express/Node.js)
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start development server with nodemon (port 5001)
npm start                # Start production server
```

### Frontend (React/Vite)
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start development server (default port 5173)
npm run build            # Build for production
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

## Architecture Overview

### Stack
- **Frontend**: React 19 with Vite, TailwindCSS, DaisyUI, Zustand for state management
- **Backend**: Express.js with ES modules, MongoDB/Mongoose, JWT authentication
- **Real-time**: Stream Chat SDK for messaging and video calls
- **API Communication**: Axios with credentials (cookies)

### Project Structure

**Backend** (`/backend`):
- Entry point: `src/server.js` - Express server with CORS configured for localhost:5173-5176
- Authentication: JWT-based with httpOnly cookies, middleware in `src/middleware/auth.middleware.js`
- Database: MongoDB via Mongoose, connection in `src/lib/db.js`
- Stream Chat integration: `src/lib/stream.js` handles user creation and token generation
- Routes: `/api/auth`, `/api/users`, `/api/chat`

**Frontend** (`/frontend`):
- Entry: `src/main.jsx` → `App.jsx` with React Router
- API client: `src/lib/axios.js` configured for `http://localhost:5001/api` with credentials
- Authentication: Custom hooks (`useLogin`, `useSignUp`, `useLogout`, `useAuthUser`)
- State: Zustand store for theme management
- Pages: Authentication flow (Login/SignUp → Onboarding → HomePage) with protected routes
- UI: TailwindCSS with DaisyUI components, custom theme selector

### Environment Variables Required

Backend `.env`:
- `PORT` - Server port (e.g., 5001)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET_KEY` - Secret for JWT tokens
- `STREAM_API_KEY` - Stream Chat API key
- `STREAM_API_SECRET` - Stream Chat API secret

### Key Implementation Details

1. **Authentication Flow**: 
   - Users register/login → receive JWT in httpOnly cookie
   - Stream Chat token generated on authentication
   - Onboarding required before accessing main app

2. **Protected Routes**: 
   - App.jsx handles route protection based on `authUser` and `isOnboarded` status
   - Unauthenticated users redirected to `/login`
   - Non-onboarded users redirected to `/onboarding`

3. **Social Features**:
   - **Posts/Feed**: Users can create posts with visibility settings, like, comment, share
   - **Friends System**: Send/accept friend requests with notifications
   - **Following**: Follow/unfollow users independently of friendship
   - **Search**: Real-time user search with debouncing
   - **Profiles**: View user profiles with privacy controls
   - **Notifications**: Real-time notification system for all social interactions

4. **Real-time Features**:
   - Stream Chat SDK handles messaging between users
   - Video calls implemented via Stream Video SDK
   - Online/offline status tracking
   - Message privacy settings (everyone/friends/none)

5. **Privacy & Security**:
   - User blocking functionality
   - Profile visibility settings (public/friends/private)
   - Message privacy controls
   - Content visibility controls per post

6. **API Communication**:
   - Frontend uses Axios instance with base URL and credentials
   - Backend validates JWT from cookies via auth middleware
   - CORS configured for local development ports
   - Pagination implemented for feeds and large data sets