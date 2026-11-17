# Blogology Frontend

Editorial web client for Blogology, a publishing platform built with Next.js 16, React 19, Tailwind CSS v4, and TanStack React Query. It pairs an editorial reading experience with a block-based writing canvas, real-time AI assistance, and high-performance hybrid rendering.

---

## What Was Made

### 1. Hybrid Rendering Architecture
- **Public Routes:** Public article pages, author profiles, and the landing page utilize Server-Side Rendering (SSR) and Next.js Cache Components (`"use cache"`) to guarantee optimal search engine optimization and immediate initial page paints.
- **Authenticated Routes:** Dashboards, writer views, and feeds run Client-Side Rendering (CSR) backed by Server Actions, Route Handlers, and TanStack React Query for snappy client-side navigation.
- **Network Boundary:** Authentication checks and protected route redirects run through the Next.js 16 `proxy.ts` boundary using secure session cookies.

### 2. Editorial Design System
- Built on Tailwind CSS v4 with a high-contrast editorial look.
- Typography pairing featuring Newsreader for serif editorial headlines and Inter for clear UI interfaces.
- Seamless light and dark mode toggling using `next-themes` with zero hydration flash.

### 3. Block-Based Story Editor
- Modular writing canvas powered by BlockNote (`@blocknote/react`).
- Slash command menus for rapid block insertions (headings, bulleted lists, quotes, code blocks).
- Floating formatting toolbar with instant selection tools.
- Auto-save integration serializing clean block JSON directly to the backend storage schema.

### 4. AI-Powered Writing and Reading Engine
- **Article Summaries:** One-click executive summary generation for readers, cached on the backend.
- **Inline Rephrase Tool:** Contextual rewrite assistant embedded directly inside the editor selection toolbar.
- **Interactive AI Panel:** Drafting sidebar to brainstorm, expand, and structure story drafts.
- **Smooth Stream Token Buffer:** Custom client-side streaming engine using `requestAnimationFrame` that buffers irregular Server-Sent Events (SSE) into human-speed, jitter-free typography.

### 5. Reader Engagement and Social Graph
- **Optimistic Interactions:** Likes, bookmarks, and author follow/unfollow actions update the user interface immediately before network round-trips complete.
- **Reader Discussions:** Nested, hierarchical comment threads on published articles.
- **Global Search:** Live debounced search across stories, topics, and authors with instant preview cards.

### 6. Profile, Sessions, and Subscription Management
- **Authentication:** Google OAuth 2.0 and email/password registration with automatic DiceBear initials avatars.
- **Profile Customization:** Built-in modal for image cropping, bio updates, and username changes.
- **Active Sessions:** Multi-device session inspection and individual session revocation.
- **Billing Portal:** Integrated Stripe Checkout workflows for Free and Pro subscriptions, unlocking increased daily AI generation quotas.

---

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router, `proxy.ts`, Cache Components)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **State and Cache:** TanStack React Query v5
- **Editor:** BlockNote
- **Theme:** next-themes
- **Icons:** Lucide React

---

## Project Structure

```
frontend/
├── app/                  # Next.js App Router (pages, layouts, route handlers)
│   ├── (root)/           # Public and authenticated core views
│   ├── onboarding/       # Reader topic and interest onboarding
│   ├── write/            # Fullscreen block editor page
│   └── page.tsx          # Editorial landing page
├── components/           # Modular UI components
│   ├── editor/           # BlockNote editor and custom toolbars
│   ├── feed/             # Feed cards and infinite scroll lists
│   ├── landing/          # Landing page sections and interactive mockups
│   ├── layout/           # Navigation bars, sidebars, and theme toggles
│   ├── posts/            # Article views, AI summary cards, and comment trees
│   ├── profile/          # Profile tabs, crop dialogs, and session lists
│   └── shared/           # Buttons, modals, and AI smooth stream renderers
├── hooks/                # Custom hooks (smooth AI streaming, responsive viewports)
├── lib/                  # API client, service layer, constants, and utilities
└── proxy.ts              # Next.js 16 network boundary proxy
```

---

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Running instance of the Blogology backend API

### 1. Environment Configuration

Create an environment file:

```bash
cp .env.example .env.local
```

Configure the backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Production Build

```bash
npm run build
npm run start
```
