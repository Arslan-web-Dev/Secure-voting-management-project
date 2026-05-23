# SecureVote — Secure Voting Management Platform

A production-ready, full-stack election management system built with React + Vite + Supabase. Role-based access for admins, election creators, and voters.

---

## 🚀 Live Deployment (Vercel)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Arslan-web-Dev/Secure-voting-management-project)

### Manual Vercel Deployment

1. Import the repository at [vercel.com/new](https://vercel.com/new)
2. Vercel will auto-detect `vercel.json` — **no framework settings needed**
3. Add Environment Variables (see below)
4. Click **Deploy**

---

## ⚙️ Environment Variables

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Your Supabase anon/public key |

Get these from: [supabase.com/dashboard](https://supabase.com/dashboard) → Your Project → Settings → API

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run all migration files in order:
   ```
   supabase/migrations/
   ```
3. Optionally run `supabase/seed_demo_users.sql` for demo data

---

## 💻 Local Development

```bash
# Clone
git clone https://github.com/Arslan-web-Dev/Secure-voting-management-project.git
cd Secure-voting-management-project/Client

# Install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
npm run dev
```

---

## 🏗️ Architecture

```
Secure-voting-management-project/
├── vercel.json              # Vercel deployment config (SPA rewrites + security headers)
├── Client/                  # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx          # Root router with protected routes
│   │   ├── features/
│   │   │   ├── admin/       # Super admin dashboard
│   │   │   ├── elections/   # Election creator tools
│   │   │   ├── voting/      # Voter portal
│   │   │   ├── candidates/  # Candidate management
│   │   │   └── analytics/   # Live results
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   └── auth/        # Login + Signup
│   │   ├── layouts/         # AuthLayout, DashboardLayout
│   │   ├── store/           # Zustand auth store
│   │   └── lib/             # Supabase client
│   └── public/
│       ├── robots.txt
│       └── _redirects       # SPA fallback
└── supabase/
    ├── migrations/          # SQL schema files
    └── seed_demo_users.sql
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Framer Motion |
| Routing | React Router v6 |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Deployment | Vercel |

### User Roles

| Role | Access |
|---|---|
| `super_admin` | Full admin panel, user management, audit logs |
| `election_creator` | Create/manage elections, view results |
| `voter` | Vote in assigned elections, view results |

---

## 🔒 Security

- All protected routes require authentication
- Role-based access control enforced client-side (and should be enforced in Supabase RLS policies)
- Security headers set via `vercel.json`: `X-Frame-Options`, `X-XSS-Protection`, `X-Content-Type-Options`, `Referrer-Policy`
- Assets are cache-immutable with hashed filenames
- Environment variables are never committed (see `.gitignore`)

---

## 📦 Build & Performance

- **Code splitting**: vendor bundles separated (React, Supabase, Charts, PDF)
- **Main bundle**: ~123KB gzipped (down from 1.6MB monolithic)
- **Asset caching**: 1-year cache on all `/assets/*`

