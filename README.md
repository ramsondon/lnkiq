# lnkiq.net

A bookmark management and browsing intelligence platform. Store bookmarks via browser plugin or web app, track where you spend your time online, and gain insights with optional AI-powered content analysis.

## Features

- 🔖 **Smart Bookmarks** — Save any page instantly with browser extension
- 🔄 **Cross-Device Sync** — Access bookmarks from any device
- 📊 **Activity Timeline** — Track time spent on sites and visualize patterns
- 🏷️ **Smart Tags** — AI-suggested tags based on content analysis
- 🔐 **Privacy First** — You control your data, opt-in content analysis

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon PostgreSQL (Serverless)
- **Auth**: NextAuth.js v5 (Auth.js)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- Neon PostgreSQL database (via Vercel integration)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

Create a `.env.local` file with:

```env
# Database (from Vercel/Neon)
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Auth.js (generate with: openssl rand -base64 32)
AUTH_SECRET="your-secret"

# OAuth Providers
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_MICROSOFT_ENTRA_ID_ID=""
AUTH_MICROSOFT_ENTRA_ID_SECRET=""
AUTH_APPLE_ID=""
AUTH_APPLE_SECRET=""
```

## OAuth Setup

### 1. GitHub (Easiest)
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000` (dev) / `https://lnkiq.net` (prod)
4. Set Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID → `AUTH_GITHUB_ID`
6. Generate secret → `AUTH_GITHUB_SECRET`

### 2. Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://lnkiq.net/api/auth/callback/google`

### 3. Microsoft
1. Go to [Azure Portal](https://portal.azure.com) → App registrations
2. Register new application
3. Add redirect URI: `https://lnkiq.net/api/auth/callback/microsoft-entra-id`

### 4. Apple
1. Go to [Apple Developer](https://developer.apple.com)
2. Requires Apple Developer account ($99/year)
3. Create Services ID with Sign in with Apple capability

## Project Structure

```
src/
├── app/
│   ├── [lang]/              # Localized routes (en, de)
│   │   ├── auth/            # Sign in, error pages
│   │   ├── dashboard/       # Protected user dashboard
│   │   ├── content-analysis/
│   │   ├── privacy/
│   │   └── terms/
│   └── api/auth/            # NextAuth API routes
├── components/
│   ├── auth/                # Auth UI components
│   ├── Navbar.tsx
│   └── Logo.tsx
├── i18n/                    # Internationalization (EN, DE)
├── lib/
│   └── prisma.ts            # Database client
├── auth.ts                  # NextAuth configuration
└── proxy.ts                 # Middleware (i18n + auth)
```

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

## License

Private - All rights reserved © 2026 lnkiq.net
