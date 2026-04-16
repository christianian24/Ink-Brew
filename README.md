# Ink & Brew

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-6366f1?style=for-the-badge&logo=nextauth.js)](https://authjs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel Blob](https://img.shields.io/badge/Vercel_Blob-Storage-000000?style=for-the-badge&logo=vercel)](https://vercel.com/storage/blob)

Ink & Brew is a high-performance publishing ecosystem engineered for modern storytellers and readers. It bridges the gap between structured drafting and digital consumption through a vertically integrated architecture, handling serialized content delivery, real-time persistence, and multi-device state synchronization.

Built to demonstrate advanced full-stack engineering principles, the platform prioritizes server-side execution, type safety, and optimized asset delivery.

## Competitive Positioning

Ink & Brew is architected to address the technical and UX limitations of existing publishing solutions:

- **vs. Blogging Platforms (Medium, Substack)**: While blogging platforms utilize flat, article-centric models, Ink & Brew implements a **hierarchical chapter-based architecture** specifically designed for serialized literature.
- **vs. Fiction Communities (Wattpad)**: Ink & Brew replaces the ad-heavy, low-fidelity legacy interfaces with a **premium, distraction-free drafting suite** and a performance-optimized reader.
- **vs. Generic Writing Tools (Notion, Google Docs)**: Unlike standalone editors, Ink & Brew integrates the writing environment directly with the **publishing and consumption layer**, eliminating export friction and enabling built-in reading progress tracking.

## Performance & Security

The platform leverages the cutting-edge capabilities of the Next.js ecosystem to ensure a secure, lightning-fast user experience:

- **React Server Components (RSC)**: Data fetching is handled entirely on the server, significantly reducing client-side bundle size and eliminating unnecessary hydration cycles.
- **Server Actions**: All mutations are performed via secure, type-safe Server Actions. This architecture provides built-in CSRF protection and reduces the attack surface by keeping API logic off the client.
- **E2E Type Safety**: Leveraging TypeScript and Prisma, the application maintains a strict type-safe contract from the database schema down to the UI components.
- **Stateless Session Management**: Auth.js manages JWT-based sessions stored in secure, `httpOnly` cookies, ensuring resilient and scalable authentication.
- **Asset Optimization**: High-resolution cover images are served through Vercel Blob CDNs with signed URLs, ensuring performant and secure asset delivery globally.

## Scalability Strategy

The architecture is designed for effortless horizontal scaling:

- **Stateless Deployment**: The core application logic is hosted as serverless functions, allowing the platform to scale instantly with traffic demand across different regions.
- **Managed Connection Pooling**: Database transactions are handled via managed PostgreSQL pooling (Neon/Supabase), ensuring stability during high concurrent load.
- **Edge Readiness**: The application is structured for future migration to the Next.js Edge Runtime, bringing compute closer to the user for sub-millisecond latency.
- **CDN-Backed Storage**: All binary data is offloaded to Vercel Blob, utilizing geographically distributed caches to minimize TTFB for media assets.

## Engineering Principles

- **Data Integrity**: Strict relational constraints and transactional logic ensure that book, chapter, and user relationships remain consistent even during complex concurrent operations.
- **Minimal JavaScript Philosophy**: The platform prioritizes server-rendered content, keeping the main-thread execution on the client focused strictly on critical interactivity (e.g., the Tiptap editor).
- **UX Discipline**: Consistent implementation of optimistic updates and granular loading patterns ensures the interface feels responsive and alive, even during background network operations.
- **Clean Architecture**: A clear separation of concerns between business logic (Server Actions), UI (React Components), and infrastructure (Prisma/Auth.js).

## Core Features

### Authoring Suite
- **Rich Text Editor**: A Tiptap-powered workspace optimized for long-form narrative structure.
- **Real-time Persistence**: Intelligent auto-save functionality driven by optimized background synchronization.
- **Content Management**: Comprehensive tools for managing serialized chapters, book metadata, and cover art.

### Reader Experience
- **Progress Tracking**: Automatic synchronization of reading states, cross-referenced between users and chapters.
- **Personal Library**: A unified hub for managing bookmarks, "Want to Read" lists, and historical activity.
- **Social Integration**: High-performance engagement systems including nested comments, likes, and follows.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Auth.js (v5)
- **Storage**: Vercel Blob for asset management
- **Editor**: Tiptap Rich Text Framework
- **Styling**: Tailwind CSS 4, Next Themes

## Installation & Local Setup

### Step 1: Clone and Install
```bash
git clone https://github.com/christianian24/Ink-Brew.git
cd Ink-Brew
npm install
```

### Step 2: Environment Configuration
Create a `.env` file with the following:
```env
DATABASE_URL="your-postgresql-url"
AUTH_SECRET="your-secret"
BLOB_READ_WRITE_TOKEN="your-blob-token"
```

### Step 3: Database & Run
```bash
npx prisma generate
npx prisma db push
npm run dev
```

## Philosophy

Ink & Brew is a technical manifesto on **Digital Content Sovereignty.**

The project's vision is to build an ecosystem where the tools of creative production and the mechanisms of global distribution are unified into a single, high-performance node. By treating the written word with the same engineering rigor as high-scale financial data, we aim to provide authors with a resilient infrastructure that transcends the limitations of traditional publishing silos. It is a commitment to performance, technical excellence, and the enduring power of the story.

## License
MIT License - Copyright (c) 2026 Christian Ian
