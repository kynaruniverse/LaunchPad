# LaunchPad 🚀

A Product Hunt-style community platform for discovering, sharing, and upvoting the best new digital products.

## Tech Stack

- **Frontend**: React 18 + Vite + React Router v6
- **Styling**: CSS custom properties (no CSS framework)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, Database, Storage)
- **Deploy**: GitHub Pages via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Local Development

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/launchpad.git
   cd launchpad
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (never commit this):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Supabase Setup

The app requires the following tables in your Supabase project:

- `profiles` — user profiles (id, username, full_name, avatar_url, bio)
- `products` — submitted products (title, tagline, description, category, tags, media_urls, website_url, upvote_count, comment_count, view_count, trending_score, status, user_id)
- `upvotes` — join table (user_id, product_id)
- `comments` — comments (user_id, product_id, content, parent_id)
- `collections` — user collections (user_id, title, description, is_public)
- `notifications` — activity notifications (user_id, actor_id, type, product_id, comment_id, read)

The app also uses a `increment_product_view` RPC function to atomically increment view counts.

## Deployment

The GitHub Actions workflow at `.github/workflows/deploy.yml` automatically builds and deploys to GitHub Pages on every push to `main`.

**Required GitHub Secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

> **Note**: A `404.html` is generated from `index.html` at build time to support SPA client-side routing on GitHub Pages.

## Features

- 📈 Leaderboard & 💎 Undiscovered product feeds
- 🔀 Sort by Newest, Most Upvoted, or Trending score
- 🏷️ Category filtering
- 🚀 Upvoting with optimistic UI updates
- 💬 Comments
- 📦 Product submission with live preview
- 📊 Maker dashboard with stats
- 🔖 Collections (create & manage)
- 🔔 Notifications
- 🔐 Email/password auth with profile creation
