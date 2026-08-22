# LinguaConnect — Complete Technical Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Setup](#4-environment-setup)
5. [Installation & Running](#5-installation--running)
6. [Authentication Flow](#6-authentication-flow)
7. [Database Models](#7-database-models)
8. [Backend API Reference](#8-backend-api-reference)
9. [Frontend Pages & Routes](#9-frontend-pages--routes)
10. [Middleware Stack](#10-middleware-stack)
11. [Real-time Features](#11-real-time-features)
12. [AI Integration](#12-ai-integration)
13. [Payment & Subscriptions](#13-payment--subscriptions)
14. [File Upload & Storage](#14-file-upload--storage)
15. [Email System](#15-email-system)
16. [Gamification System](#16-gamification-system)
17. [Spaced Repetition System](#17-spaced-repetition-system)
18. [Partner Matching](#18-partner-matching)
19. [B2B Organization Features](#19-b2b-organization-features)
20. [Admin Dashboard](#20-admin-dashboard)
21. [Security](#21-security)
22. [Deployment](#22-deployment)
23. [Testing](#23-testing)

---

## 1. Project Overview

LinguaConnect is a full-stack SaaS web application for language learning that combines:
- Structured daily lessons and challenges
- AI-powered tutoring and conversation practice
- Social networking with a real-time feed
- Language exchange partner matching
- Real-time chat and video calling
- Gamification (XP, streaks, achievements, leaderboards)
- Stripe subscription monetization
- B2B organization accounts

**Project Name (in code):** SkillForge
**Backend Port:** 5001
**Frontend Port:** 5173

---

## 2. Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19.0.0 | UI framework |
| Vite | 6.3.1 | Build tool |
| TailwindCSS | 3.4.17 | Styling |
| DaisyUI | 5.0.43 | Component library |
| Zustand | 5.0.4 | Global state management |
| TanStack React Query | 5.75.1 | Server state & caching |
| React Router | 7.5.3 | Client-side routing |
| Axios | (via lib) | HTTP client |
| Socket.io Client | 4.8.1 | Real-time events |
| Stream Chat React | 13.2.1 | Messaging UI |
| Stream Video React SDK | 1.18.9 | Video calls |
| React Hot Toast | 2.5.2 | Notifications |
| Lucide React | 0.511.0 | Icons |
| Date-fns | 3.6.0 | Date utilities |
| Lodash | 4.17.21 | Utility functions |
| Canvas Confetti | 1.9.3 | Celebration animations |
| Sentry React | 10.17.0 | Error tracking |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Express | 4.21.2 | Web framework |
| Mongoose | 8.14.1 | MongoDB ODM |
| JWT (jsonwebtoken) | 9.0.2 | Authentication |
| Bcryptjs | 3.0.2 | Password hashing |
| Socket.io | 4.8.1 | Real-time server |
| Stream Chat | 8.60.0 | Chat infrastructure |
| OpenAI | 5.16.0 | AI features |
| Stripe | 19.0.0 | Payments |
| Cloudinary | 2.7.0 | Media storage |
| Nodemailer | 7.0.6 | Email sending |
| ioredis | 5.9.2 | Redis caching |
| Helmet | 8.1.0 | Security headers |
| Express Rate Limit | 8.1.0 | Rate limiting |
| Express Validator | 7.2.1 | Input validation |
| Multer | 2.0.2 | File uploads |
| Winston | 3.19.0 | Logging |
| Sentry Node | 10.17.0 | Error tracking |
| PDFKit | 0.17.2 | PDF generation |
| Nodemon | 3.1.10 | Dev auto-restart |

---

## 3. Project Structure

```
social-platform/
├── backend/
│   ├── src/
│   │   ├── server.js                  # Express app entry point
│   │   ├── config/                    # Configuration files
│   │   ├── controllers/               # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── post.controller.js
│   │   │   ├── chat.controller.js
│   │   │   ├── learning.controller.js
│   │   │   ├── dailyTask.controller.js
│   │   │   ├── vocabulary.controller.js
│   │   │   ├── aiTutor.controller.js
│   │   │   ├── matching.controller.js
│   │   │   ├── notification.controller.js
│   │   │   ├── subscription.controller.js
│   │   │   ├── organization.controller.js
│   │   │   ├── admin.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── gamification.controller.js
│   │   │   ├── referral.controller.js
│   │   │   ├── wordOfDay.controller.js
│   │   │   └── activity.controller.js
│   │   ├── models/                    # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── FriendRequest.js
│   │   │   ├── Notification.js
│   │   │   ├── UserActivity.js
│   │   │   ├── LearningProgress.js
│   │   │   ├── DailyTask.js
│   │   │   ├── vocabulary.model.js
│   │   │   ├── VocabularyReview.js
│   │   │   ├── DailyVocabularySession.js
│   │   │   ├── AITutorSession.js
│   │   │   ├── ConversationScenario.js
│   │   │   ├── ConversationSession.js
│   │   │   ├── Achievement.js
│   │   │   ├── Subscription.js
│   │   │   ├── Organization.js
│   │   │   ├── Analytics.js
│   │   │   ├── UserAnalytics.js
│   │   │   ├── DailyWordCache.js
│   │   │   └── WordOfDayCompletion.js
│   │   ├── routes/                    # Express route files (30+)
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── security.middleware.js
│   │   │   ├── performance.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   ├── cache.middleware.js
│   │   │   ├── analytics.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   └── org.middleware.js
│   │   ├── lib/
│   │   │   ├── db.js                  # MongoDB connection
│   │   │   ├── stream.js              # Stream Chat setup
│   │   │   ├── redis.js               # Redis client
│   │   │   ├── cloudinary.js          # Cloudinary setup
│   │   │   └── openai.js              # OpenAI client
│   │   ├── validators/                # Input validators
│   │   ├── services/                  # Business services
│   │   ├── data/                      # Static seed data
│   │   └── scripts/
│   │       ├── seed-database.js       # Main seed script
│   │       └── setup-indexes.js       # MongoDB indexes
│   ├── Dockerfile
│   ├── render.yaml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.jsx                    # Router + protected routes
│   │   ├── pages/                     # Page components (25+)
│   │   ├── components/                # Reusable components
│   │   ├── hooks/                     # Custom React hooks
│   │   ├── lib/
│   │   │   ├── axios.js               # Axios instance
│   │   │   └── learningApi.js         # Learning API client
│   │   ├── store/                     # Zustand stores
│   │   └── constants/
│   │       └── index.js               # Languages, constants
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml
├── docker-compose.local.yml
├── docker-compose.ngrok.yml
├── render.yaml
└── CLAUDE.md
```

---

## 4. Environment Setup

### Backend `.env`

```env
# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/skillforge

# Authentication
JWT_SECRET_KEY=your_64_byte_random_secret

# Stream Chat (getstream.io)
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret

# AI
OPENAI_API_KEY=your_openai_api_key
HF_TOKEN=your_hugging_face_token

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=LinguaConnect

# Caching
REDIS_URL=redis://localhost:6379

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
COOKIE_DOMAIN=localhost
SESSION_SECRET=your_session_secret

# Feature Flags
ENABLE_SUBSCRIPTIONS=true
ENABLE_ORGANIZATIONS=true
ENABLE_REFERRALS=true
ENABLE_GAMIFICATION=true
ENABLE_AI_FEATURES=true

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
ADMIN_EMAILS=admin@yourdomain.com
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5001/api
VITE_STREAM_API_KEY=your_stream_api_key
```

---

## 5. Installation & Running

### Prerequisites
- Node.js 20+
- MongoDB 7+ (local or Atlas)
- Redis (local or Upstash)
- npm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env        # Fill in your values
npm run dev                 # Development (nodemon, port 5001)
npm start                   # Production
npm run seed                # Seed sample data
npm run setup:indexes       # Create MongoDB indexes
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # Vite dev server (port 5173)
npm run build               # Production build
npm run preview             # Preview production build
npm run lint                # ESLint check
```

### Docker (Full Stack)
```bash
docker-compose up --build           # Start all services
docker-compose -f docker-compose.local.yml up   # Local dev variant
```

Docker services:
- **MongoDB 7** — port 27017
- **Redis 7** — port 6379
- **Node.js App** — port 5001
- **Nginx** — ports 80/443 (production profile)

---

## 6. Authentication Flow

```
1. User registers → POST /api/auth/signup
   - Password hashed with bcryptjs
   - JWT created and set as httpOnly cookie
   - Stream Chat user created
   - Verification email sent

2. Email verification → GET /api/auth/verify-email/:token
   - Token validated and user marked as verified

3. Login → POST /api/auth/login
   - Credentials validated
   - JWT cookie set
   - Stream Chat token returned

4. Protected routes → auth.middleware.js
   - JWT extracted from httpOnly cookie
   - User fetched from DB and attached to req.user

5. Logout → POST /api/auth/logout
   - JWT cookie cleared

6. Password Reset
   - POST /api/auth/forgot-password → email with reset link
   - GET /api/auth/verify-reset-token/:token → validate token
   - POST /api/auth/reset-password → update password
```

**Token Storage:** httpOnly cookies (not localStorage — prevents XSS)
**Token Expiry:** Configurable via JWT_SECRET_KEY
**Onboarding Gate:** Users must complete onboarding before accessing main app

---

## 7. Database Models

### User
```
_id, fullName, email, password (hashed), profilePic, bio
nativeLanguage, learningLanguage, location
friends[], following[], followers[], blockedUsers[]
isOnboarded, isEmailVerified, role (user/admin)
onlineStatus, lastSeen
partnerPreferences { ageRange, proficiencyLevel, learningGoals[] }
learningStats { currentStreak, bestStreak, totalXP, level }
achievements[], gamification { coins, badges[] }
messagePrivacy, profileVisibility
subscription { plan, status, stripeCustomerId }
createdAt, updatedAt
```

### Post
```
_id, author (ref: User), content, image, video
visibility (public/friends/private)
likes[], comments[{ user, content, createdAt }]
shares[], shareCount
createdAt, updatedAt
```

### LearningProgress
```
_id, user (ref: User)
totalXP, currentLevel, currentStreak, bestStreak
lastActivityDate, dailyChallenges[], vocabulary[]
conversations[], lessonsCompleted[]
learningPath { currentUnit, currentLesson, completedUnits[] }
achievements[], languagePartners[]
weeklyXP, monthlyXP
```

### DailyTask
```
_id, user (ref: User), date
taskType (vocabulary/grammar/conversation/reading/listening)
status (pending/in_progress/completed)
steps[{ type, status, completedAt }]
aiPracticeCompleted, partnerInteractionOffered
xpEarned, streakMaintained
createdAt, updatedAt
```

### VocabularyReview (Spaced Repetition)
```
_id, user (ref: User), word, translation, language
easeFactor, interval, repetitions, dueDate
lastReviewed, reviewHistory[]
masteryLevel (0-5)
```

### AITutorSession
```
_id, user (ref: User)
messages[{ role, content, timestamp }]
language, topic, difficulty
rating, feedback
startedAt, endedAt
```

### Subscription
```
_id, user (ref: User)
plan (free/basic/pro/enterprise)
status (active/cancelled/past_due)
stripeCustomerId, stripeSubscriptionId
currentPeriodStart, currentPeriodEnd
usageLimits { aiSessions, vocabularyWords, partnerMatches }
currentUsage { aiSessions, vocabularyWords, partnerMatches }
```

### Organization
```
_id, name, slug, owner (ref: User)
members[{ user, role, joinedAt }]
subscription { plan, stripeSubscriptionId }
branding { logo, primaryColor, customDomain }
settings { maxMembers, features[] }
```

### Notification
```
_id, recipient (ref: User), sender (ref: User)
type (friend_request/friend_accepted/post_like/post_comment/
      post_share/follow/message/achievement/system)
read, data {}
createdAt
```

---

## 8. Backend API Reference

### Authentication `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /signup | No | Register new user |
| POST | /login | No | Login user |
| POST | /logout | Yes | Logout user |
| POST | /onboarding | Yes | Complete onboarding |
| GET | /me | Yes | Get current user |
| POST | /forgot-password | No | Request password reset |
| GET | /verify-reset-token/:token | No | Validate reset token |
| POST | /reset-password | No | Reset password |
| POST | /send-verification | Yes | Send verification email |
| GET | /verify-email/:token | No | Verify email |
| POST | /resend-verification | Yes | Resend verification |
| GET | /verification-status | Yes | Check verification status |

### Users `/api/users`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | / | Yes | Get recommended users |
| GET | /search | Yes | Search users |
| GET | /profile/:userId | Yes | Get user profile |
| PATCH | /profile | Yes | Update own profile |
| POST | /profile-pic | Yes | Upload profile picture |
| GET | /friends | Yes | Get friends list |
| POST | /friend-request/:id | Yes | Send friend request |
| POST | /friend-request/:id/accept | Yes | Accept friend request |
| GET | /friend-requests | Yes | Incoming requests |
| GET | /outgoing-friend-requests | Yes | Outgoing requests |
| POST | /follow/:userId | Yes | Follow user |
| DELETE | /follow/:userId | Yes | Unfollow user |
| POST | /block/:userId | Yes | Block user |
| DELETE | /block/:userId | Yes | Unblock user |
| PATCH | /status | Yes | Update online status |

### Posts `/api/posts`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | / | Yes | Create post |
| GET | / | Yes | Get feed posts |
| GET | /feed | Yes | Get feed (alternate) |
| GET | /user/:userId | Yes | Get user's posts |
| DELETE | /:postId | Yes | Delete post |
| PATCH | /:postId | Yes | Edit post |
| POST | /:postId/like | Yes | Like/unlike post |
| POST | /:postId/comment | Yes | Comment on post |
| POST | /:postId/share | Yes | Share post |

### Chat `/api/chat`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /token | Yes | Get Stream Chat token |
| GET | /users | Yes | Get chat users |
| GET | /can-message/:recipientId | Yes | Check message permission |

### Learning `/api/learning`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /progress | Yes | Get learning progress |
| GET | /challenges/daily | Yes | Get daily challenges |
| POST | /challenges/complete | Yes | Complete challenge |
| GET | /vocabulary/daily | Yes | Get daily vocabulary |
| POST | /vocabulary/master | Yes | Master vocabulary word |
| GET | /videos | Yes | Get learning videos |
| POST | /videos/complete | Yes | Complete video |
| GET | /stats | Yes | Get learning stats |
| GET | /stats/weekly | Yes | Weekly stats |
| GET | /leaderboard | Yes | Global leaderboard |
| GET | /subscription/status | Yes | Subscription status |
| POST | /subscription/upgrade | Yes | Upgrade subscription |

### Daily Task `/api/daily-task`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /today | Yes | Get today's task |
| POST | /start | Yes | Start task |
| POST | /complete-ai-practice | Yes | Complete AI step |
| POST | /partner-interaction | Yes | Partner interaction |
| POST | /complete | Yes | Complete task + streak |
| GET | /history | Yes | Task history |

### Vocabulary (SRS) `/api/vocabulary`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /today-session | Yes | Today's session |
| GET | /due-reviews | Yes | All due reviews |
| GET | /due-reviews-limited | Yes | Due reviews (daily limit) |
| POST | /review/:wordId | Yes | Submit review |
| GET | /stats | Yes | Vocabulary stats |
| GET | /forecast | Yes | Review forecast |
| GET | / | Yes | All words (paginated) |
| POST | / | Yes | Add word |
| POST | /bulk | Yes | Add bulk words |
| PUT | /:wordId | Yes | Update word |
| DELETE | /:wordId | Yes | Delete word |
| POST | /:wordId/reset | Yes | Reset word progress |

### AI Tutor `/api/ai-tutor`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /start-session | Yes | Start tutor session |
| POST | /continue-session/:sessionId | Yes | Continue conversation |
| GET | /sessions | Yes | Get all sessions |
| GET | /sessions/:sessionId | Yes | Get session |
| POST | /rate-session/:sessionId | Yes | Rate session |
| POST | /quick-correct | Yes | Quick correction |
| GET | /analytics | Yes | AI analytics |

### Matching `/api/matching`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /partners | Yes | Get partner suggestions |
| GET | /search | Yes | Search partners |
| GET | /preferences | Yes | Get preferences |
| POST | /preferences | Yes | Update preferences |
| GET | /partner/:partnerId | Yes | Partner profile |
| POST | /validate-interaction | Yes | Validate interaction |

### Notifications `/api/notifications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | / | Yes | Get notifications |
| GET | /unread-count | Yes | Unread count |
| PATCH | /:id/read | Yes | Mark as read |
| PATCH | /mark-all-read | Yes | Mark all read |
| DELETE | /:id | Yes | Delete notification |

### Subscriptions `/api/subscription`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /webhook | No | Stripe webhook |
| GET | /current | Yes | Current subscription |
| POST | /checkout | Yes | Create checkout session |
| POST | /cancel | Yes | Cancel subscription |
| PUT | /update | Yes | Update subscription |
| GET | /billing-portal | Yes | Billing portal URL |
| GET | /invoices | Yes | Invoice history |

### Admin `/api/admin`
| Method | Endpoint | Auth+Admin | Description |
|---|---|---|---|
| GET | /dashboard/stats | Yes | Platform statistics |
| GET | /users | Yes | List all users |
| PATCH | /users/:userId/status | Yes | Update user status |
| GET | /revenue/analytics | Yes | Revenue data |
| GET | /content/reports | Yes | Content reports |
| PATCH | /settings | Yes | Platform settings |

---

## 9. Frontend Pages & Routes

### Public Routes
| Route | Component | Description |
|---|---|---|
| `/` | LandingPage | Landing for guests |
| `/login` | LoginPage | User login |
| `/signup` | SignUpPage | Registration |
| `/forgot-password` | ForgotPasswordPage | Password reset request |
| `/reset-password/:token` | ResetPasswordPage | Reset password form |
| `/verify-email/:token` | VerifyEmailPage | Email verification |
| `/pricing` | PricingPage | Subscription pricing |

### Protected Routes (require auth + onboarding)
| Route | Component | Sidebar |
|---|---|---|
| `/` | HomePage | Yes |
| `/feed` | FeedPage | Yes |
| `/daily-task` | DailyTaskPage | Yes |
| `/practice` | PracticePage | Yes |
| `/language-journey` | LanguageJourneyPage | Yes |
| `/find-partners` | FindPartnersPage | Yes |
| `/leaderboard` | LeaderboardPage | Yes |
| `/achievements` | AchievementsPage | Yes |
| `/profile` | ProfilePage | Yes |
| `/profile/:userId` | UserProfilePage | Yes |
| `/notifications` | NotificationPage | Yes |
| `/friends` | FriendsPage | Yes |
| `/progress` | ProgressPage | Yes |
| `/vocabulary` | VocabularyReviewPage | Yes |
| `/ai-tutor` | AITutorPage | Yes |
| `/word-of-day` | WordOfDayPage | Yes |
| `/subscription` | SubscriptionPage | Yes |
| `/checkout` | CheckoutPage | No |
| `/conversation-practice` | ConversationPracticePage | No |
| `/chat/:id` | ChatPage | No |
| `/call/:id` | CallPage | No |
| `/onboarding` | OnboardingPage | No |

---

## 10. Middleware Stack

Applied in this order in `server.js`:

1. **Sentry** — request capture and tracing
2. **Request ID** — unique ID per request
3. **Performance monitoring** — slow request detection (>1s)
4. **Helmet** — security headers (XSS, clickjacking, CSP)
5. **Suspicious activity logger** — SQL injection, path traversal detection
6. **Body size validator** — 10MB for uploads, 1MB for others
7. **JSON body parser**
8. **Cookie parser**
9. **CORS** — configured for localhost:5173-5176
10. **Input sanitizer** — XSS prevention via regex
11. **CSRF protection** — origin header validation
12. **Static file serving**
13. **Rate limiters per route:**
    - Auth: 5 req/15min
    - API: 500 req/15min
    - AI: 10 req/min
    - Chat creation: 10/hour
    - Messages: 30/min
    - Daily tasks: 3/day
    - Vocabulary: 20 req/min
14. **Sentry error handler**

---

## 11. Real-time Features

### Socket.io
- Handles real-time notifications
- Online/offline status updates
- Live feed updates

**Events emitted:**
- `notification` — new notification to recipient
- `friend_request` — new friend request
- `post_liked` — post like event
- `user_online` / `user_offline` — presence events

### Stream Chat SDK
- Full messaging infrastructure
- Users created in Stream on signup
- Token issued on auth
- Direct messages between users
- Message privacy enforced server-side

### Stream Video SDK
- Peer-to-peer video calls
- Call initiation from chat
- Route: `/call/:id`

---

## 12. AI Integration

### OpenAI API
Used in:
1. **AI Tutor** — GPT-powered tutoring sessions with context memory
2. **Conversation Practice** — scenario-based evaluation of responses
3. **Grammar Quick-Correct** — instant feedback on text input
4. **Daily Challenge Generation** — personalized daily content

### Hugging Face (fallback)
- Free tier alternative to OpenAI
- Used when `HF_TOKEN` is set and `OPENAI_API_KEY` is not

### AI Usage Limits (by plan)
| Plan | AI Sessions/month |
|---|---|
| Free | 5 |
| Basic | 20 |
| Pro | Unlimited |
| Enterprise | Unlimited |

---

## 13. Payment & Subscriptions

### Stripe Integration
- Checkout sessions for new subscriptions
- Webhook handles subscription lifecycle events
- Billing portal for self-service management

### Subscription Tiers
| Feature | Free | Basic | Pro | Enterprise |
|---|---|---|---|---|
| AI Tutor Sessions | 5/mo | 20/mo | Unlimited | Unlimited |
| Vocabulary Words | 50 | 200 | Unlimited | Unlimited |
| Partner Matches | 3/mo | 10/mo | Unlimited | Unlimited |
| Organizations | No | No | No | Yes |

### Stripe Events Handled
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## 14. File Upload & Storage

- **Multer** handles multipart form data
- Files uploaded to **Cloudinary**
- Supported: images (JPG, PNG, GIF, WebP), videos (MP4)
- Max size: 10MB (enforced by middleware)
- Used for: profile pictures, post images/videos

---

## 15. Email System

- **Nodemailer** with Resend SMTP
- Emails sent for:
  - Email verification on signup
  - Password reset link
  - Welcome email after onboarding

---

## 16. Gamification System

### XP & Levels
- XP earned for: daily tasks, vocabulary reviews, AI sessions, conversations, posting
- Level calculated from total XP thresholds

### Streaks
- `currentStreak` — consecutive days active
- `bestStreak` — all-time best streak
- Streak maintained by completing daily task
- **Bug note:** `setHours(0,0,0,0)` returns a number — always use: `const d = new Date(); d.setHours(0,0,0,0);`

### Achievements
- Defined in `Achievement` model with unlock criteria
- Types: streak milestones, XP milestones, vocabulary mastery, social milestones
- Awarded automatically when criteria met

### Leaderboard
- Global leaderboard ranked by total XP
- Weekly reset option available
- API: `GET /api/learning/leaderboard`

---

## 17. Spaced Repetition System

Based on the SM-2 algorithm:

```
New word → easeFactor=2.5, interval=1 day
After review:
  - Rating 0-2 (fail) → reset interval to 1, reduce easeFactor
  - Rating 3-4 (pass) → interval *= easeFactor
  - Rating 5 (perfect) → interval *= easeFactor, increase easeFactor
dueDate = lastReviewed + interval days
```

- Daily review sessions capped by plan limits
- `GET /api/vocabulary/forecast` — shows upcoming review load
- `GET /api/vocabulary/today-session` — today's due words

---

## 18. Partner Matching

Algorithm considers:
- Native language = partner's learning language (mutual exchange)
- Learning language = partner's native language
- Proficiency level compatibility
- Age range preferences
- Learning goals overlap
- Online status

API: `GET /api/matching/partners`

---

## 19. B2B Organization Features

- Organizations have `slug` for public URL
- Roles: `owner`, `admin`, `member`
- Custom branding (logo, primaryColor, customDomain)
- Bulk CSV invite via `POST /api/organization/:slug/invite/bulk`
- Organization-level Stripe subscriptions separate from individual plans
- Analytics available at organization level

---

## 20. Admin Dashboard

Accessible to users with `role: "admin"` (set via `ADMIN_EMAILS` env var).

Features:
- Platform-wide user stats
- Revenue analytics (MRR, churn, new subscribers)
- User management (view, suspend, activate)
- Content moderation reports
- Platform settings management
- Cohort retention analytics

---

## 21. Security

| Measure | Implementation |
|---|---|
| Authentication | JWT in httpOnly cookies |
| Password storage | bcryptjs hash |
| SQL injection | Input sanitization middleware |
| XSS | Helmet CSP + input sanitizer |
| CSRF | Origin header validation |
| Rate limiting | Per-feature limits (auth, AI, chat, etc.) |
| Security headers | Helmet (X-Frame-Options, HSTS, etc.) |
| Body size limits | 10MB uploads, 1MB general |
| Error tracking | Sentry (frontend + backend) |
| Logging | Winston structured logs |

---

## 22. Deployment

### Docker
```bash
docker-compose up --build
```

Services: MongoDB, Redis, Node.js app, Nginx (production)

### Render.com
- `render.yaml` in root and `/backend`
- Auto-deploy from GitHub
- Environment variables set in Render dashboard

### Environment Notes
- Set `NODE_ENV=production` in production
- Use MongoDB Atlas for managed database
- Use Upstash for managed Redis
- Configure Cloudinary for media
- Set Stripe webhook URL to `https://yourdomain.com/api/subscription/webhook`

---

## 23. Testing

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
npm run test:ui           # Vitest UI
npm run test:coverage     # Coverage report
```

---

*Documentation generated: March 2026*
