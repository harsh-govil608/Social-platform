# LangPal

`Node 20` `React 19` `MongoDB` `Express` `Redis` `BullMQ` `Socket.io` `OpenAI` `Stream.io` `Stripe` `MIT License`

---

## Overview

LangPal is an AI-powered language learning social platform that connects learners worldwide through real-time chat, video calls, partner matching, and gamified study features. Users build vocabulary, practice conversation with AI tutors and human partners, track their streaks and XP, and collaborate in a socially-driven feed -- all in one place.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT                            │
│  React 19 + Vite │ TanStack Query │ Zustand         │
│  Socket.io-client │ Stream Chat/Video SDK            │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP + WebSocket
┌───────────────────────▼─────────────────────────────┐
│                 EXPRESS SERVER                       │
│  Helmet │ Rate Limiting │ JWT Auth │ CORS            │
│  REST API │ Socket.io │ Swagger Docs                 │
└──┬──────────┬───────────┬────────┬────────┘
   │            │               │            │
┌──▼──┐   ┌────▼────┐   ┌──────▼───┐  ┌────▼─────┐
│MongoDB│  │  Redis  │   │ BullMQ   │  │External  │
│Atlas  │  │  Cache  │   │ Job Queue│  │Services  │
│41 MDL │  │Rate Lmt │   │Wiki AI   │  │OpenAI    │
└──────┘  └─────────┘   └──────────┘  │Stream.io │
                                        │Stripe    │
                                        │Sentry    │
                                        └──────────┘
```

---

## Features

| Category | Features |
|---|---|
| **Authentication** | JWT via httpOnly cookies, email verification, password reset, GDPR-compliant account deletion |
| **Social Feed** | Create/like/comment/share posts, visibility controls (public / friends / private) |
| **Friends and Following** | Send/accept friend requests, follow/unfollow independently, user blocking |
| **Partner Matching** | AI-driven partner matching by language, proficiency, and availability |
| **Real-time Chat** | 1-on-1 and group messaging via Stream Chat SDK, message privacy controls |
| **Video Calls** | In-app video calls powered by Stream Video SDK |
| **AI Tutor** | Multi-personality AI tutor sessions (OpenAI) with contextual conversation guidance |
| **Conversation Practice** | Structured and dynamic conversation scenarios with AI feedback |
| **Daily Tasks** | Curated daily challenges, grammar exercises, pronunciation practice |
| **Vocabulary and Spaced Repetition** | Flashcard-style vocab review with SM-2 spaced repetition scheduling |
| **Word of the Day** | Merriam-Webster integration, daily word completions, streak rewards |
| **Gamification** | XP system, level progression, streak tracking, achievements/badges |
| **Leaderboard** | Global and friends leaderboards ranked by XP and streaks |
| **Wiki** | AI-processed knowledge base -- submit URLs or text, BullMQ queues them for processing |
| **Language Journey** | Curated roadmaps and milestones for each language |
| **Certificates** | Downloadable PDF certificates for completed milestones |
| **Notifications** | Real-time notifications for social interactions via Socket.io |
| **Subscriptions** | Stripe-powered subscription plans with premium feature gating |
| **Organizations (B2B)** | Multi-tenant organization support with admin dashboards |
| **Analytics** | Per-user and platform-wide analytics dashboard |
| **Code Arena** | Coding challenges and DSA problem solver (language learning + CS skills) |
| **Referrals** | Referral program with reward tracking |
| **Profiles** | Public/friends/private profile visibility, bio, native/learning language |
| **Progress Tracking** | XP history, streak calendars, daily challenge completion rates |
| **Search** | Real-time debounced user search |

---

## Tech Stack

| Layer | Frontend | Backend | Infrastructure |
|---|---|---|---|
| **Language** | JavaScript (ES Modules) | JavaScript (ES Modules) | -- |
| **Runtime / Framework** | React 19 + Vite 6 | Node.js 20 + Express 4 | -- |
| **State Management** | Zustand 5 | -- | -- |
| **Data Fetching** | TanStack Query 5 | -- | -- |
| **Styling** | TailwindCSS 3 + DaisyUI 5 | -- | -- |
| **Real-time** | Socket.io-client 4, Stream Chat/Video SDK | Socket.io 4, Stream Chat SDK | -- |
| **Database** | -- | Mongoose 8 + MongoDB Atlas | MongoDB Atlas |
| **Cache / Queues** | -- | ioredis + BullMQ 5 | Redis |
| **Auth** | Axios (cookie-based) | jsonwebtoken, bcryptjs | httpOnly cookies |
| **AI** | -- | OpenAI SDK 5 | OpenAI API |
| **Payments** | -- | Stripe 19 | Stripe |
| **File Upload** | -- | Multer + Cloudinary | Cloudinary |
| **Email** | -- | Nodemailer | SMTP / Mailtrap |
| **PDF** | -- | PDFKit | -- |
| **Validation** | -- | express-validator, Joi | -- |
| **Security** | -- | Helmet, express-rate-limit | -- |
| **API Docs** | -- | swagger-jsdoc + swagger-ui-express | -- |
| **Error Tracking** | @sentry/react | @sentry/node | Sentry |
| **Testing** | Vitest + Testing Library | Jest + Supertest | -- |
| **Logging** | -- | Winston | -- |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas account (or local MongoDB 7+)
- Redis instance (local or upstash.io)
- Accounts / API keys: Stream.io, OpenAI, Stripe, Cloudinary, Sentry (optional)

### Clone

```bash
git clone https://github.com/your-org/social-platform.git
cd social-platform
```

### Backend Setup

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)

npm run dev        # Development server on port 5001 (nodemon)
# npm start        # Production server
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Development server on port 5173
# npm run build   # Production build
# npm run preview # Preview production build
```

---

## Environment Variables

All variables go in `backend/.env`.

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Express server port | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/langpal` |
| `JWT_SECRET_KEY` | Secret used to sign JWT tokens | `supersecretkey` |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `CLIENT_URL` | Allowed CORS origin (frontend URL) | `http://localhost:5173` |
| `STREAM_API_KEY` | Stream Chat API key | `abc123` |
| `STREAM_API_SECRET` | Stream Chat API secret | `supersecret` |
| `OPENAI_API_KEY` | OpenAI API key for AI tutor / wiki | `sk-...` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4o-mini` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123secret` |
| `EMAIL_HOST` | SMTP host for Nodemailer | `smtp.mailtrap.io` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `user@example.com` |
| `EMAIL_PASS` | SMTP password | `emailpassword` |
| `EMAIL_FROM` | Sender address | `noreply@langpal.app` |
| `SENTRY_DSN` | Sentry DSN for error tracking | `https://xxx@sentry.io/yyy` |
| `MERRIAM_WEBSTER_API_KEY` | Merriam-Webster Dictionary API key | `mw-api-key` |

---

## API Documentation

Interactive Swagger API documentation is available at:

```
http://localhost:5001/api/docs
```

The docs are auto-generated from JSDoc annotations in the route files using `swagger-jsdoc` and served via `swagger-ui-express`.

---

## Testing

### Backend (Jest + Supertest)

```bash
cd backend
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Frontend (Vitest + Testing Library)

```bash
cd frontend
npm test                  # Run all tests
npm run test:ui           # Vitest UI browser
npm run test:coverage     # Coverage report
```

---

## Project Structure

```
social-platform/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers (25 controllers)
│   │   ├── models/         # Mongoose schemas (41 models)
│   │   ├── routes/         # Express route definitions (30+ routes)
│   │   ├── services/       # Business logic (wiki, conversation AI)
│   │   ├── middleware/     # Auth, security, cache, analytics, performance
│   │   ├── queues/         # BullMQ job queues (wiki processing)
│   │   ├── lib/            # DB, Stream, Stripe, AI, Redis, Socket utilities
│   │   └── tests/          # Jest + Supertest test suite
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/          # 38 page components
    │   ├── components/     # 40+ reusable components
    │   ├── hooks/          # Custom React hooks (auth, data fetching)
    │   └── lib/            # API clients (Axios instances per domain)
    └── package.json
```

---

## Key Design Decisions

- **httpOnly cookies instead of localStorage for JWT**: Prevents XSS attacks from accessing tokens via JavaScript. Combined with `sameSite` and `secure` flags in production, this is the safest token storage strategy for browser clients.

- **BullMQ + Redis for Wiki AI processing**: AI summarization of submitted URLs and documents is slow and can fail. Offloading it to a BullMQ job queue decouples HTTP response time from AI latency, enables retries on failure, and keeps the API responsive.

- **Tiered rate limiting via express-rate-limit + Redis**: Different endpoints have different abuse profiles (auth endpoints need stricter limits than feed reads). A Redis-backed rate limiter scales correctly across multiple server instances in production.

- **AI fallback chain for tutor/conversation features**: The OpenAI integration uses a configurable model with graceful degradation -- if a premium model quota is exhausted, the system falls back to a lighter model, avoiding hard failures for users mid-session.

- **Stream Chat/Video SDK instead of raw WebRTC**: Building reliable real-time messaging and video from scratch is a significant undertaking. Stream handles connection state, offline delivery, and scaling, allowing the team to focus on product features rather than infrastructure.

- **Spaced repetition (SM-2) for vocabulary**: Random flashcard drills have poor long-term retention. The SM-2 algorithm schedules each word's next review based on recall quality, maximizing retention per study minute -- a well-validated approach from cognitive science.

---

## License

MIT License -- see [LICENSE](LICENSE) for details.
