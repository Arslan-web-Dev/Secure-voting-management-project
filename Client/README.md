# 🗳️ Secure Voting Management System - Client

> A secure, modern, and scalable voting platform built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm 7+ or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Arslan-web-Dev/Secure-voting-management-project.git

# Navigate to client directory
cd Client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Then edit .env.local with your Supabase credentials
```

### Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Professional Project Structure

```
src/
├── components/          # Reusable UI components
├── features/           # Feature-based modules
│   ├── admin/          # Admin dashboard
│   ├── analytics/      # Analytics & results
│   ├── auth/           # Authentication
│   ├── candidates/     # Candidate management
│   ├── elections/      # Election management
│   └── voting/         # Voting interface
├── layouts/            # Page layouts
├── pages/              # Page components
├── store/              # Zustand state management
├── lib/                # Utilities & helpers
│   ├── supabaseClient.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/              # Custom React hooks
├── types/              # TypeScript interfaces
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## 🔐 Authentication

### Supported Roles
- **Super Admin**: Full system access, user management, audit logs
- **Election Creator**: Create and manage elections  
- **Voter**: Vote in available elections

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Zustand (state management)
- Tailwind CSS (styling)
- Framer Motion (animations)

### Backend
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS)

## 🚢 Deployment

### Vercel
```bash
npm run build  # Test locally
git push       # Deploy automatically
```

See main README.md for complete documentation

