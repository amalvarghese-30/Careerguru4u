# Career Guru — Architecture Documentation

> **Generated:** 2026-08-18  
> **Version:** 1.0.0  
> **Status:** All P0-P3 security tasks complete

---

## 1. Technology Stack

### Core Framework
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.2.6 | App Router, React Server Components, Server Actions |
| **Runtime** | React | 19.2.4 | Client & server components |
| **Language** | TypeScript | ^5 | Type safety across frontend/backend |
| **Styling** | Tailwind CSS | ^4 | Utility-first CSS with PostCSS |
| **Animation** | Framer Motion | ^12.40.0 | Page transitions, micro-interactions |

### Database & ORM
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Database** | MongoDB | 7.2.0 (driver) | Primary data store (no Mongoose) |
| **Connection** | Native MongoClient | — | Connection pooling, TLS enforced |
| **Indexing** | Custom `ensureIndexes()` | — | Auto-creates indexes on startup |

### Authentication & Security
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **JWT** | `jsonwebtoken` + `jose` | 9.0.2 / 6.2.3 | Token signing (HS256) & verification (edge-compatible) |
| **Password Hash** | `bcryptjs` | 2.4.3 | Secure password storage |
| **Rate Limiting** | Upstash Redis (`@upstash/redis`) | 1.38.2 | Distributed rate limiting with login lockout |
| **CSRF** | `jose` (SignJWT/jwtVerify) | 6.2.3 | Double-submit cookie pattern |
| **XSS Prevention** | `isomorphic-dompurify` | 3.22.0 | HTML sanitization for stored content |
| **Security Headers** | Next.js `headers()` + Middleware | — | CSP, HSTS, X-Frame-Options, etc. |
| **Audit Logging** | Custom `lib/audit-log.ts` | — | Immutable admin action trail |
| **Env Validation** | `lib/startup-validation.ts` | — | Fail-fast at startup for missing secrets |

### State Management
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Client Auth** | Zustand | 5.0.14 | Global auth store (no persist middleware) |
| **Server State** | TanStack Query | 5.100.14 | Data fetching, caching, mutations |
| **Forms** | React Hook Form + Zod | 7.76.1 / 4.4.3 | Validation & form handling |

### AI & Content Processing
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **LLM SDK** | `@anthropic-ai/sdk` | 0.104.2 | Career matching, content enhancement |
| **Math Rendering** | KaTeX | 0.17.0 | LaTeX math in solutions |
| **Rich Text** | TipTap | 3.27.1 | Block-based editor for solutions/admin |
| **PDF Export** | jsPDF | 4.2.1 | Resume generation |
| **Flowcharts** | React Flow + Dagre | 11.11.4 / 0.8.5 | Interactive career decision trees |

### Media & File Handling
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Image CDN** | Cloudinary | 2.6.0 | Optimized image delivery, transformations |
| **File Upload** | Native FormData + API route | — | Magic-bytes validation, size limits |

### Scraping & Ingestion (Development Only)
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Browser Automation** | Playwright | 1.60.0 | Headless scraping for textbook solutions |
| **HTML Parsing** | Cheerio | 1.2.0 | Server-side DOM parsing |
| **Pipeline** | Custom ingestion pipeline | — | Discovery → Parse → Normalize → Validate → Export |

### Development Tooling
| Tool | Purpose |
|------|---------|
| ESLint 9 + Next.js config | Linting |
| TypeScript 5 | Type checking |
| tsx | TypeScript execution for scripts |
| Playwright | E2E testing & scraping |

---

## 2. Directory Structure

```
career-guru/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: login, register
│   ├── (public)/                 # Route group: all public pages
│   │   ├── academic/             # Board/class/subject solutions
│   │   ├── ai-tools/             # Career match, resume builder, salary predictor
│   │   ├── blog/                 # Blog listing + [slug] detail
│   │   ├── careers/              # Career library + [slug] detail
│   │   ├── compare/              # College/career comparison
│   │   ├── counselling/          # Lead capture for counselling
│   │   ├── career-guidance/      # After-10th streams, flowcharts
│   │   ├── mock-test/            # Practice tests (board + entrance)
│   │   ├── scholarships/         # Scholarship listings
│   │   ├── universities/         # College directory + [slug] detail
│   │   ├── success-stories/      # Testimonials
│   │   ├── contact/              # Contact form
│   │   └── dashboard/            # Protected: user dashboard
│   ├── admin/                    # Admin panel (protected by middleware)
│   │   ├── analytics/            # Admin metrics
│   │   ├── blog/                 # Blog CRUD
│   │   ├── careers/              # Career CRUD
│   │   ├── colleges/             # College CRUD + hide toggle
│   │   ├── counselling/          # Counselling request management
│   │   ├── concept-notes/        # Concept note CRUD
│   │   ├── entrance-exams/       # Entrance exam management
│   │   ├── flowcharts/           # Flowchart CRUD
│   │   ├── leads/                # Lead management
│   │   ├── mock-tests/           # MCQ management
│   │   ├── scholarships/         # Scholarship CRUD
│   │   ├── settings/             # Site settings
│   │   ├── solutions/            # Solution CRUD + AI enhance
│   │   ├── syllabus/             # Syllabus CRUD
│   │   ├── textbooks/            # Textbook management
│   │   ├── users/                # User management (role promotion)
│   │   ├── login/                # Admin login
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API Routes (see Section 3)
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout + startup validation
│   └── page.tsx                  # Home page
│
├── components/
│   ├── admin/                    # Admin-only components
│   │   ├── BlockEditCard.tsx     # Block-based content editor
│   │   ├── BlockListEditor.tsx   # Multi-block editor orchestrator
│   │   ├── RichTextEditor.tsx    # TipTap-based editor
│   │   ├── SolutionBlockEditor.tsx
│   │   └── AiEnhanceButton.tsx
│   ├── auth/
│   │   └── AuthHydrator.tsx      # Client-side session hydration
│   ├── content/                  # Solution rendering blocks
│   │   ├── blocks/               # Paragraph, Equation, Table, Image, List, Callout, Code, Quote, Hyperlink, Heading
│   │   ├── BlockRenderer.tsx     # Polymorphic block renderer
│   │   └── SolutionViewer.tsx    # Full solution page component
│   ├── features/                 # Feature-specific components
│   │   ├── resume-builder/       # Wizard, Preview, Export, ATS Score, TemplateSelector
│   │   ├── DecisionTree*.tsx     # Career flowchart components
│   │   ├── SolutionCard.tsx
│   │   ├── CareerFlowchart.tsx
│   │   └── LoginGate.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   └── RootLayoutClient.tsx  # Providers, Toasts, CSRF bootstrap
│   ├── sections/                 # Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedColleges.tsx
│   │   ├── MaharashtraTextbooks.tsx
│   │   ├── LeadCaptureForm.tsx
│   │   ├── TrustBar.tsx
│   │   └── ... (15+ sections)
│   └── ui/                       # Reusable UI primitives
│       ├── GlassCard.tsx
│       ├── GradientButton.tsx
│       ├── LoginModal.tsx
│       ├── SectionHeader.tsx
│       └── WhatsAppButton.tsx
│
├── lib/                          # Shared utilities
│   ├── ai/
│   │   ├── client.ts             # Anthropic SDK wrapper
│   │   └── enhancer.ts           # Content enhancement prompts
│   ├── auth-store.ts             # Zustand auth store (client)
│   ├── api-auth.ts               # Server-side JWT verification helpers
│   ├── audit-log.ts              # Admin action audit trail
│   ├── careers-data.ts           # Static career data
│   ├── db/
│   │   ├── mongodb.ts            # MongoClient singleton + indexes
│   │   └── models.ts             # TypeScript interfaces for collections
│   ├── decision-tree/            # Career flowchart data (PCM, PCB, Commerce, Arts, etc.)
│   ├── logger.ts                 # Dev-only console wrapper + securityLogger
│   ├── rate-limit.ts             # In-memory rate limiter (fallback)
│   ├── rate-limit-redis.ts       # Upstash Redis distributed rate limiter
│   ├── sanitize.ts               # DOMPurify HTML sanitization
│   ├── security.ts               # Helpers: escapeRegex, magic bytes validation
│   ├── startup-validation.ts     # Fail-fast env validation at import
│   ├── utils.ts                  # clsx + tailwind-merge helper
│   └── validations/
│       └── index.ts              # Zod schemas for API validation
│
├── scripts/                      # Development & ingestion scripts
│   ├── ingestion/                # Full pipeline: discovery → parse → normalize → validate → export
│   │   ├── discovery/            # Boards, classes, subjects, textbooks, chapters, questions
│   │   ├── parser/               # DOM parser + block factory
│   │   ├── equation/             # LaTeX ↔ Unicode math conversion
│   │   ├── table/                # HTML table extraction
│   │   ├── media/                # Image/video detection & download
│   │   ├── formula/              # Formula detection
│   │   ├── normalizer/           # Content normalization
│   │   ├── validator/            # Quality checks & reporting
│   │   ├── export/               # JSON + MongoDB export
│   │   ├── crawler/              # Queue, cache, Playwright fetcher
│   │   ├── pipeline.ts           # Orchestration
│   │   └── types/                # ContentBlock, BlockType definitions
│   ├── crawler/                  # Legacy crawler modules
│   ├── scrape-playwright.ts      # Playwright-based scraping entry
│   ├── crawl.ts                  # CLI crawl command
│   ├── seed.ts                   # Database seeding
│   └── verify.ts                 # Data verification
│
├── scraped-data/                 # Local JSON caches (gitignored in prod)
│   ├── maharashtra/
│   ├── cbse/
│   └── icse/
│
├── public/                       # Static assets
├── node_modules/
├── package.json
├── tsconfig.json
├── next.config.ts                # Security headers, CSP, image domains
├── middleware.ts                 # Auth, RBAC, CSRF, security headers
├── ARCHITECTURE.md               # This file
├── CLAUDE.md                     # AI assistant instructions
└── AGENTS.md                     # Agent workflow definitions
```

---

## 3. API Endpoints Map

### Public API Routes (No Auth Required)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | User login, returns JWT in httpOnly cookie |
| `/api/auth/register` | POST | User registration |
| `/api/auth/verify` | GET | Verify JWT token, return user profile |
| `/api/contact` | POST | Contact form submission |
| `/api/leads` | POST | Lead capture (counselling requests) |
| `/api/solutions` | GET | List/filter textbook solutions |
| `/api/solutions/view` | GET | View single solution (with auth for bookmarks) |
| `/api/solutions/bookmark` | POST/DELETE | Toggle bookmark (requires auth) |
| `/api/colleges` | GET | List/filter colleges |
| `/api/colleges/[slug]` | GET | College detail |
| `/api/scholarships` | GET | List/filter scholarships |
| `/api/blog` | GET | List blog posts |
| `/api/blog/[slug]` | GET | Single blog post |
| `/api/careers` | GET | List careers |
| `/api/careers/[slug]` | GET | Career detail |
| `/api/mcq` | GET | List MCQ questions |
| `/api/mcq/submit` | POST | Submit MCQ attempt (requires auth) |
| `/api/mcq/generate` | POST | AI-generate MCQs (requires auth) |
| `/api/textbooks` | GET | List textbooks |
| `/api/public/textbooks` | GET | Public textbook listing (eBalbharati) |
| `/api/textbooks/download` | GET | Track download count |
| `/api/exam/patterns` | GET | Entrance exam patterns |
| `/api/exam/info/[exam]` | GET | Exam details |
| `/api/exam/analytics` | GET | Exam analytics (requires auth) |
| `/api/flowcharts` | GET | Career flowcharts |
| `/api/academic/filters` | GET | Filter options for academic content |
| `/api/academic/stats` | GET | Academic content statistics |
| `/api/site-settings` | GET | Public site settings |
| `/api/upload` | POST | File upload (Cloudinary) |
| `/api/resume` | POST/GET | Create/list resumes (requires auth) |
| `/api/resume/[id]` | GET/PUT/DELETE | Resume CRUD (requires auth) |
| `/api/resume/ats-score` | POST | AI ATS scoring (requires auth) |
| `/api/counselling/request` | POST | Submit counselling request |

### Protected User API Routes (`/api/user/*` — Requires `student` role+)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/user/dashboard` | GET | User dashboard data (progress, bookmarks, etc.) |
| `/api/user/bookmarks` | GET/POST/DELETE | User bookmarks |
| `/api/user/match-results` | GET | Career match results |

### Admin API Routes (`/api/admin/*` — Requires `admin` or `super_admin`)

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/admin/users` | GET/POST/PUT/DELETE | User management (self-promotion blocked) |
| `/api/admin/colleges` | GET/POST/PUT/DELETE | College CRUD + hide toggle |
| `/api/admin/scholarships` | GET/POST/PUT/DELETE | Scholarship CRUD |
| `/api/admin/blog` | GET/POST/PUT/DELETE | Blog post CRUD |
| `/api/admin/careers` | GET/POST/PUT/DELETE | Career CRUD |
| `/api/admin/solutions` | GET/POST/PUT/DELETE | Solution CRUD |
| `/api/admin/solutions/filters` | GET | Filter options for admin solutions |
| `/api/admin/solutions/ai-enhance` | POST | AI content enhancement |
| `/api/admin/concept-notes` | GET/POST/PUT/DELETE | Concept note CRUD |
| `/api/admin/syllabus` | GET/POST/PUT/DELETE | Syllabus CRUD |
| `/api/admin/textbooks` | GET/POST/PUT/DELETE | Textbook management |
| `/api/admin/flowcharts` | GET/POST/PUT/DELETE | Flowchart CRUD |
| `/api/admin/counselling` | GET/PUT/DELETE | Counselling request management |
| `/api/admin/leads` | GET/PUT/DELETE | Lead management |
| `/api/admin/analytics` | GET | Admin analytics dashboard |
| `/api/admin/settings` | GET/PUT | Site settings |
| `/api/admin/mock-tests` | GET/POST/PUT/DELETE | MCQ/Question management |
| `/api/admin/entrance-exams` | GET/POST/PUT/DELETE | Entrance exam management |

### Role Hierarchy
```
student (1) < counsellor (2) < admin (3) < super_admin (4)
```

---

## 4. Core Data Flow

### 4.1 Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT REQUEST                                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE (middleware.ts)                          │
│  1. Path matching: /api/*, /dashboard/*, /admin/*                          │
│  2. Public route check: bypasses auth for whitelisted paths                │
│  3. Token extraction: Authorization header OR cg-auth-token cookie         │
│  4. JWT verification (jose): validates sig, exp, iss, aud                  │
│  5. Role-based access: admin routes require role.level ≥ 3                │
│  6. CSRF validation: POST/PUT/PATCH/DELETE require valid x-csrf-token     │
│  7. Inject headers: x-user-id, x-user-email, x-user-role                  │
│  8. Security headers: CSP, HSTS, X-Frame-Options, etc.                    │
│  9. CSRF token cookie: auto-provisioned if missing                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         ┌─────────────────────┐          ┌─────────────────────┐
         │   API ROUTES        │          │   PAGE ROUTES       │
         │   (app/api/**)      │          │   (app/**/page.tsx) │
         └─────────────────────┘          └─────────────────────┘
                    │                               │
                    ▼                               ▼
         ┌─────────────────────┐          ┌─────────────────────┐
         │ lib/api-auth.ts     │          │ Server Components   │
         │ • getToken()        │          │ • Direct DB access  │
         │ • verifyAuth()      │          │   via clientPromise │
         │ • requireAdmin()    │          │ • No JWT verification│
         └─────────────────────┘          └─────────────────────┘
                    │                               │
                    ▼                               ▼
         ┌─────────────────────────────────────────────────────┐
         │              lib/db/mongodb.ts                      │
         │  • MongoClient singleton (global in dev)            │
         │  • TLS enforced, certificate validation enabled     │
         │  • ensureIndexes() runs on startup (non-blocking)  │
         └─────────────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌─────────────────────────────────────────────────────┐
         │                    MONGODB                          │
         │  Database: career_guru                              │
         │  Collections: users, solutions, colleges, scholarships,│
         │  careers, blog, mcq_questions, user_progress,      │
         │  bookmarks, leads, counselling_requests,           │
         │  flowcharts, concept_notes, syllabus, textbooks,   │
         │  settings, audit_logs, ...                         │
         └─────────────────────────────────────────────────────┘
```

### 4.2 Authentication Flow

```
LOGIN (POST /api/auth/login)
────────────────────────────
1. Rate limit check (Redis): max 5 attempts/15min per email+IP
2. Find user by email/phone
3. bcrypt.compare(password, hash)
4. Check user.status !== 'inactive'/'suspended'
5. Sign JWT (HS256): { userId, email, fullName, role }
   - expiresIn: 7d, issuer: career-guru, audience: career-guru-users
6. Set httpOnly cookie: cg-auth-token (secure, sameSite=strict, 7d)
7. Clear Redis rate limit counter on success
8. Return user object (no password)

SESSION VERIFICATION (GET /api/auth/verify)
────────────────────────────
1. Extract token from Authorization header OR cookie
2. jwt.verify(token, JWT_SECRET, { issuer, audience })
3. Fetch user from MongoDB by userId
4. Return user profile (no password)

CLIENT HYDRATION (AuthHydrator.tsx)
────────────────────────────
1. On mount: call /api/auth/verify
2. On success: useAuthStore.setAuth(user)
3. On 401: useAuthStore.logout()
4. Provides global auth state to all client components
```

### 4.3 CSRF Protection Flow

```
CSRF TOKEN GENERATION
────────────────────────────
1. Middleware checks for csrf-token cookie
2. If missing: SignJWT({ ts: Date.now() }, CSRF_SECRET, 24h expiry)
3. Set httpOnly cookie: csrf-token (secure, sameSite=strict)

CSRF VALIDATION (state-changing requests)
────────────────────────────
1. Read cookieToken from csrf-token cookie
2. Read headerToken from x-csrf-token header
3. Verify: cookieToken === headerToken AND jwtVerify(cookieToken, CSRF_SECRET)
4. Skip for: /api/auth/*, public API mutations (contact, leads)
5. On failure: 403 (API) or redirect to /login?csrf=invalid (pages)
```

### 4.4 Rate Limiting Flow (Redis)

```
LOGIN RATE LIMIT
────────────────────────────
Key: "login:{email}:{ip}"
1. Increment counter in Redis (INCR)
2. If first request: set TTL 15min
3. If count > 5: set lockout key with 30min TTL
4. Return { ok, lockedOut, retryAfterSec, lockoutUntil }
5. On successful login: DEL rate limit keys

API RATE LIMIT (general)
────────────────────────────
Key: "ratelimit:{ip}:{path}"
- 100 requests/minute default (configurable)
- Returns 429 with Retry-After header
```

### 4.5 Data Mutation Flow (Admin Example)

```
PUT /api/admin/colleges
────────────────────────────
1. Middleware: auth + admin role + CSRF valid
2. Zod validation: college schema
3. securityLogger.error() for audit trail
4. MongoDB: updateOne({ _id }, { $set: data })
5. Return updated document
6. Client: TanStack Query invalidates cache → refetch
```

### 4.6 Solution Rendering Pipeline

```
TEXTBOOK SOLUTION DISPLAY
────────────────────────────
1. Client fetches /api/solutions?board=X&class=Y&subject=Z
2. Server: MongoDB find with filters + pagination
3. Response: { solutions: ContentBlock[] }
4. Client: SolutionViewer → BlockRenderer → polymorphic blocks
   - ParagraphBlock → <p>
   - EquationBlock → KaTeX render (LaTeX)
   - TableBlock → <table> with sorting
   - ImageBlock → <img> with Cloudinary optimization
   - ListBlock → <ul>/<ol>
   - CalloutBlock → styled div (warning, info, etc.)
   - CodeBlock → syntax highlighted
   - HeadingBlock → <h1-h6>
5. MathRenderer: parses $...$ and $$...$$ for inline/display math
```

### 4.7 Scraping & Ingestion Pipeline (Offline)

```
DISCOVERY → CRAWL → PARSE → NORMALIZE → VALIDATE → EXPORT
────────────────────────────────────────────────────────────
1. Discovery: identify boards, classes, subjects, chapters
2. Crawler: Playwright fetches pages (with TLS validation)
3. Parser: Cheerio + BlockFactory → ContentBlock[]
   - Handles equations, tables, images, lists, code
4. Normalizer: cleans HTML, fixes encoding, standardizes math
5. Validator: quality checks (completeness, image validity, etc.)
6. Export: JSON files → MongoDB import via scripts/import-*.ts
```

---

## 5. Security Architecture Summary

| Layer | Implementation |
|-------|----------------|
| **Transport** | HTTPS enforced (HSTS in prod), secure cookies |
| **Authentication** | JWT (HS256) with iss/aud claims, httpOnly cookies, 7-day expiry |
| **Authorization** | Middleware RBAC (role hierarchy), route-level protection |
| **CSRF** | Double-submit cookie (JWT-based), enforced on mutations |
| **Rate Limiting** | Redis-backed (Upstash), login lockout after 5 failures |
| **XSS Prevention** | DOMPurify on all stored HTML, CSP with strict directives |
| **Injection Prevention** | `escapeRegex()` for MongoDB queries, magic-bytes file validation |
| **Audit Trail** | Immutable logs for admin mutations (user, action, before/after) |
| **Secrets** | Startup validation fails fast if JWT_SECRET, MONGODB_URI missing |
| **Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy |

---

## 6. Key Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Security headers, CSP, image domains, CORS |
| `middleware.ts` | Auth, RBAC, CSRF, security headers (edge runtime) |
| `lib/startup-validation.ts` | Fail-fast env validation at import time |
| `lib/security.ts` | `escapeRegex()`, magic bytes validation |
| `lib/logger.ts` | Dev-only console + always-on securityLogger |
| `lib/rate-limit-redis.ts` | Distributed rate limiting with lockout |
| `lib/audit-log.ts` | Admin action audit trail |
| `lib/sanitize.ts` | DOMPurify configuration |
| `lib/validations/index.ts` | Zod schemas for all API inputs |

---

## 7. Deployment Considerations

| Area | Requirement |
|------|-------------|
| **Environment Variables** | `MONGODB_URI`, `JWT_SECRET` (32+ chars), `JWT_ISSUER`, `JWT_AUDIENCE`, `CSRF_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CLOUDINARY_*`, `ANTHROPIC_API_KEY` |
| **Node Version** | ≥20 (Next.js 16 requirement) |
| **Redis** | Upstash (serverless) for rate limiting |
| **MongoDB** | Atlas or self-hosted with TLS |
| **Image CDN** | Cloudinary (configured in next.config.ts) |
| **Build** | `next build` → standalone output for Docker |
| **Runtime** | `next start` (production server) |

---

*End of Architecture Document*