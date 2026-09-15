# CampusConnect 🎓

> **A high-performance academic Q&A and student networking platform built for university communities.**  
> Inspired by Stack Overflow and Reddit — engineered with modern React Native best practices.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture Highlights](#-architecture-highlights)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🚀 Overview

**CampusConnect** is a mobile-first community platform built exclusively for university students. It bridges the gap between unstructured campus group chats and structured technical Q&A, providing a focused academic space where students can ask questions, share knowledge, earn reputation, and connect with peers — all within their university ecosystem.

---

## ✨ Features

### 🏠 Home Feed
- Personalized question feed filtered by the user's university
- Filter tabs: **For You**, **Trending** (by upvotes), **Needs Answer** (unanswered posts)
- Category chips: Programming, Mathematics, Physics, Engineering, Chemistry, Medicine, Business, and more
- Pull-to-refresh with skeleton loading states
- Virtualized `FlatList` with windowing for smooth scrolling

### 🔍 Explore
- **Subject discovery** — browse all academic subjects with instant search filtering
- **University communities** — tap any university to view its hub page (top students + posts)
- **Trending Academic Topics** — dynamically ranked by a score: `views + (upvotes × 5) + (answers × 10) + top_student_bonus`
- **Student search** — find peers by name, username, or major with 300ms debounced queries
- **"View Posts"** on any subject navigates to a dedicated subject posts page
- Show More pagination for universities (6 at a time) and subjects (8 at a time)
- Skeleton loading states for all data sections

### 📚 Subject Posts Page
- Dedicated page for every academic subject (`/explore/subject/[name]`)
- Subject banner with category pill and live post count
- Virtualized post list with skeleton loading and empty state
- Quick **Ask in [Subject]** shortcut button in header and empty state

### 🏛 University Hub Page
- University banner with name and location
- Horizontal scroll of **Top Students** with reputation score
- All community questions from that university

### ❓ Ask a Question
- Rich question composer with:
  - Subject area category selector (horizontal chip scroll)
  - **Smart Course Picker** — bottom sheet with full searchable majors list + "Other" fallback for custom course codes
  - Syntax-highlighted **code snippet** editor with language picker
  - Multi-image attachment via gallery or camera with client-side compression
  - Tag system for topic tagging
  - **Live Preview** modal before publishing
- Auto-notifies all followers when a new post is published

### 💬 Direct Messages
- 1-on-1 real-time student chat powered by Supabase Realtime
- Inline code snippets and image attachments in messages
- Auto-provisions or discovers existing conversation records
- Conversation list with last message preview and timestamps

### 🔔 Notifications
- Real-time push notifications via Expo Notifications
- In-app notification feed: upvotes, answers, follows, new posts from followed users
- Supabase Realtime subscription for live badge updates

### 👤 Profile
- User profile with avatar, bio, university, major, year, GPA
- Reputation score and **Top Student** / Dean's List badge system
- Post history, saved posts, and answer history tabs
- Follow / Unfollow with real-time follower counts
- Profile settings with avatar upload

### 🔐 Authentication
- Email/password sign-up and login via Supabase Auth
- Secure password reset flow with deep-link token exchange
- Onboarding flow: university selection, major, academic year, GPA, username, avatar

### 🌙 Theme
- Full **dark / light mode** support via Zustand-persisted theme store
- Native window background kept in sync to prevent white flash on swipe-back (iOS)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo SDK 57](https://expo.dev) + [React Native 0.86](https://reactnative.dev) |
| **Language** | TypeScript 6 |
| **Navigation** | [Expo Router v4](https://docs.expo.dev/router/introduction/) — file-based, typed routing |
| **Backend & DB** | [Supabase](https://supabase.com) — PostgreSQL, Row Level Security, Realtime, Storage |
| **Server State** | [TanStack React Query v5](https://tanstack.com/query/latest) — `staleTime`, `gcTime`, optimistic updates |
| **Client State** | [Zustand v5](https://github.com/pmndrs/zustand) — auth session, theme |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod v4](https://zod.dev) |
| **Media** | [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) + [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) |
| **Icons** | [Lucide React Native](https://lucide.dev) |
| **Animations** | [React Native Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) |
| **Notifications** | [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) |

---

## 📁 Project Structure

```
campus-connect/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout — QueryClient, auth guard, theme
│   ├── index.tsx                 # Entry redirect (auth → main or onboarding)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx    # Deep-link token exchange
│   ├── (onboarding)/             # First-run onboarding flow
│   │   └── complete-profile.tsx
│   ├── (main)/                   # Authenticated app shell
│   │   ├── (tabs)/               # Bottom tab navigator
│   │   │   ├── index.tsx         # Home feed
│   │   │   ├── explore.tsx       # Explore — search, subjects, universities
│   │   │   ├── ask.tsx           # Ask a question (tab shortcut)
│   │   │   ├── messages.tsx      # Conversation list
│   │   │   └── profile.tsx       # Own profile
│   │   ├── ask.tsx               # Full-screen ask composer
│   │   ├── post/[id].tsx         # Question detail + answers
│   │   ├── messages/[id].tsx     # Chat room
│   │   ├── notifications.tsx     # Notification feed
│   │   ├── profile/settings.tsx  # Profile editor
│   │   └── explore/
│   │       ├── university/[id].tsx  # University hub
│   │       └── subject/[name].tsx   # Subject posts page
│   └── user/[id].tsx             # Public user profile
│
├── src/
│   ├── components/
│   │   ├── features/             # Domain-specific components
│   │   │   ├── PostCard.tsx
│   │   │   ├── AnswerCard.tsx
│   │   │   ├── ChatBubble.tsx
│   │   │   └── BadgesShowcaseModal.tsx
│   │   └── ui/                   # Reusable primitives
│   │       ├── Avatar.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Skeleton.tsx
│   │       ├── CodeBlock.tsx
│   │       ├── LanguagePicker.tsx
│   │       ├── ImageViewerModal.tsx
│   │       ├── Card.tsx
│   │       └── TopStudentBadge.tsx
│   ├── services/                 # Supabase API layer
│   │   ├── api.posts.ts          # Posts CRUD + search + likes/saves
│   │   ├── api.answers.ts        # Answers CRUD + accept + voting
│   │   ├── api.auth.ts           # Auth helpers
│   │   ├── api.chat.ts           # Conversations + messages
│   │   ├── api.explore.ts        # Universities, majors, students, trending
│   │   ├── api.notifications.ts  # Notification fetch + mark-read
│   │   └── storage.ts            # Supabase Storage uploads
│   ├── store/
│   │   ├── useAuthStore.ts       # Session + user profile (Zustand)
│   │   ├── useThemeStore.ts      # Dark/light theme (Zustand + AsyncStorage)
│   │   └── useChatStore.ts       # Optimistic message state
│   ├── hooks/
│   │   ├── useDebounce.ts        # 300ms debounce for search inputs
│   │   └── useRealtimeNotifications.ts
│   ├── constants/
│   │   ├── queryKeys.ts          # Centralized TanStack Query key factory
│   │   ├── categories.ts         # Academic subject categories
│   │   ├── majors.ts             # CAMPUS_MAJORS fallback list
│   │   ├── badges.ts             # Badge definitions
│   │   └── theme.ts              # SPACING, RADIUS, color tokens
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client
│   │   ├── notifications.ts      # Push token registration
│   │   ├── ranking.ts            # Top student score algorithm
│   │   └── topStudent.ts         # Top student threshold logic
│   ├── types/
│   │   ├── models.ts             # Post, Profile, University, Message, etc.
│   │   └── database.types.ts     # Supabase generated types
│   └── utils/
│       ├── formatters.ts         # Date, number formatting
│       ├── imageCompressor.ts    # Client-side image resize before upload
│       └── validators.ts         # Zod schemas
│
├── supabase/                     # Supabase migrations & config
├── .env                          # Environment variables (not committed)
├── .env.example                  # Template for environment setup
├── app.json                      # Expo app config
├── eslint.config.js
└── tsconfig.json
```

---

## 🏗 Architecture Highlights

### Centralized Query Key Factory
All TanStack Query cache keys are defined in [`src/constants/queryKeys.ts`](./src/constants/queryKeys.ts) following the TanStack v5 factory pattern. This ensures consistent cache invalidation across screens and prevents stale data bugs.

### Eliminated Sequential DB Round-Trips
The `fetchPosts` search path previously fired two sequential Supabase queries (one to resolve university IDs, one for posts). University IDs are now resolved from the caller's TanStack Query cache via `useMemo` and passed as `universityIds?: string[]` — saving ~200–400ms per search keystroke.

### Static Data `staleTime: Infinity`
Universities and academic majors are effectively static during a session. Both queries use `staleTime: Infinity` so they are fetched once and never refetch on tab focus — shared across the Explore screen, Subject Picker in Ask, and the Subject Posts page with zero duplicate network requests.

### Optimistic UI with Error Rollback
Post upvotes and answer votes use derived optimistic state (`optimisticState !== null ? optimisticState : serverState`), avoiding `setState` inside `useEffect`. UI reflects changes instantly and rolls back gracefully on network failure.

### Client-Side Image Compression
All images (posts, avatars, chat attachments) are compressed with Expo Image Manipulator to 80% JPEG quality before upload, minimizing bandwidth on cellular connections and reducing Supabase Storage costs.

### Virtualized Lists Throughout
- Home feed uses `FlatList` with `initialNumToRender={6}`, `maxToRenderPerBatch={8}`, `windowSize={7}`, `removeClippedSubviews` (Android)
- Subject posts page uses `FlatList` with `initialNumToRender={8}`
- Explore screen paginates universities (6) and subjects (8) with "Show More" to avoid rendering 100+ items at once

### Real-Time Subscriptions
- Chat messages subscribe to PostgreSQL row inserts via `supabase.channel('messages:<conversationId>')`
- Notifications subscribe to the user's notification row with live badge count updates

---

## 🗄 Database Schema

```
universities (id, name, short_name, location, domain, logo_url)
├── majors (id, name, category)
└── profiles (id, university_id, full_name, username, major, year, gpa, reputation, is_top_student, avatar_url)
    ├── posts (id, author_id, university_id, course_code, category, title, content, code_snippet, code_language, image_urls, tags, upvotes_count, answers_count, views_count, is_solved)
    │   ├── answers (id, post_id, author_id, content, code_snippet, is_accepted, upvotes_count)
    │   │   └── answer_votes (id, answer_id, user_id, vote_type)
    │   ├── post_likes (id, post_id, user_id)
    │   └── saved_posts (id, post_id, user_id)
    ├── conversations (id, created_at)
    │   ├── conversation_members (id, conversation_id, user_id)
    │   └── messages (id, conversation_id, sender_id, content, code_snippet, image_url, created_at)
    ├── notifications (id, user_id, actor_id, type, post_id, conversation_id, title, body, is_read, created_at)
    └── followers (id, follower_id, following_id, created_at)
```

Row Level Security (RLS) is enabled on all tables. Policies ensure users can only read/write their own data or publicly visible content.

---

## 💻 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Expo Go** app on your phone, or an Android/iOS emulator
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/CampusConnect.git
cd CampusConnect/campus-connect

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env
```

### Running the App

```bash
# Start Expo dev server with cache cleared
npx expo start -c

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios
```

---

## 🔑 Environment Variables

Create a `.env` file in the `campus-connect/` root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

These values are available in your Supabase dashboard under **Project Settings → API**.

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android emulator |
| `npm run ios` | Open on iOS simulator |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type check |
| `npx prettier --write .` | Format all files with Prettier |
| `npx expo-doctor` | Check Expo SDK health |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please run `npx prettier --write .` and `npx tsc --noEmit` before submitting a PR.

---

<div align="center">
  <sub>Built with ❤️ for university students everywhere.</sub>
</div>
