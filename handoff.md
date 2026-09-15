# 🚀 CampusConnect — Project Handoff & Continuity Guide

> **Note for AI Assistants & Developers**:  
> Always keep this document up to date when implementing new features, modifying architecture, adding dependencies, or changing project conventions. Consult this file at the start of every session to ensure consistency and prevent regressions.

---

## 📌 Project Overview

**CampusConnect** is a university-centric academic Q&A and collaboration mobile application built with React Native & Expo. Students can ask course-specific questions, share code snippets and images, answer peer questions, earn reputation/badges, connect with top students, and chat in real-time.

---

## 🛠 Tech Stack & Core Dependencies

| Category                  | Technology                                                         | Notes                                    |
| :------------------------ | :----------------------------------------------------------------- | :--------------------------------------- |
| **Framework**             | Expo SDK `~54.0.35`                                                | Target SDK (Strictly Expo v54 rules)     |
| **Runtime / Core**        | React 19 (`19.1.0`), React Native `0.81.5`                         | New Architecture ready                   |
| **Routing**               | Expo Router `~6.0.24`                                              | File-based navigation under `/app`       |
| **Backend & DB**          | Supabase (`@supabase/supabase-js` `^2.112.2`)                      | PostgreSQL, Auth, Realtime, Storage      |
| **Data Fetching**         | `@tanstack/react-query` `^5.101.4`                                 | Server state management & caching        |
| **Client State**          | `zustand` `^5.0.14`                                                | Auth session, chat presence, theme store |
| **Forms & Validation**    | `react-hook-form` + `zod` (`^4.4.3`)                               | Typed form validation                    |
| **Animations / Gestures** | `react-native-reanimated` `~4.1.1`, `react-native-gesture-handler` | Native animations and interactions       |
| **Icons & Media**         | `lucide-react-native`, `expo-image`, `expo-image-manipulator`      | Vector icons & optimized image handling  |

---

## 📂 Architecture & Directory Structure

```
campus-connect/
├── app/                          # Expo Router File-Based Routing
│   ├── (auth)/                   # Authentication flow
│   │   ├── login.tsx             # Login screen
│   │   ├── signup.tsx            # Signup screen
│   │   └── forgot-password.tsx   # Password reset screen
│   ├── (onboarding)/             # New user onboarding
│   │   └── complete-profile.tsx  # Academic profile setup (University, Major, GPA)
│   ├── (main)/                   # Authenticated core app
│   │   ├── (tabs)/               # Bottom tab navigation
│   │   │   ├── index.tsx         # Home feed (All, Trending, Following, Unanswered)
│   │   │   ├── explore.tsx       # Search, Universities, Courses, Top Students
│   │   │   ├── ask.tsx           # Quick redirect or modal trigger
│   │   │   ├── messages.tsx      # Conversations list & direct chats
│   │   │   └── profile.tsx       # Current user profile & stats
│   │   ├── ask.tsx               # Full Ask Question screen with code/image picker
│   │   ├── notifications.tsx     # Activity notifications center
│   │   ├── post/[id].tsx         # Post details, answers, nested replies
│   │   ├── messages/[id].tsx     # Realtime 1-on-1 / post-linked chat screen
│   │   ├── profile/settings.tsx  # Account & theme settings
│   │   └── explore/university/[id].tsx # University detail screen
│   ├── user/[id].tsx             # Public user profile screen
│   ├── _layout.tsx               # Root navigation stack & auth gatekeeper
│   └── index.tsx                 # Root entrypoint / redirector
├── src/
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives (Button, Input, Card, Avatar, CodeBlock, etc.)
│   │   └── features/             # Domain components (PostCard, AnswerCard, ChatBubble)
│   ├── constants/                # Theme colors, categories, badge definitions
│   ├── lib/                      # Supabase client, notifications, ranking, top student algorithms
│   ├── services/                 # API service modules (posts, answers, chat, auth, notifications)
│   ├── store/                    # Zustand stores (useAuthStore, useChatStore, useThemeStore)
│   ├── types/                    # TypeScript interfaces & models (`models.ts`)
│   └── utils/                    # Formatters, image compressors, zod validators
├── supabase/
│   ├── schema.sql                # Complete database schema, RLS policies, triggers
│   └── seed.sql                  # Initial seed data for development
└── handoff.md                    # Project tracking and handoff guide
```

---

## 🚦 Key Systems & Implementation Details

### 1. Authentication & Route Guarding

- Managed via `src/store/useAuthStore.ts` and `app/_layout.tsx`.
- Auto-listens to Supabase Auth state (`onAuthStateChange`).
- Directs unauthenticated users to `(auth)/login`.
- If a user has not completed onboarding (`university_id` or `major` missing), redirects to `(onboarding)/complete-profile`.

### 2. Feed & Q&A System

- **Categories & Courses**: Questions can be linked to universities, course codes, and specific categories.
- **Code Highlighting**: `CodeBlock` component supports syntax display with a language selector modal (`LanguagePicker`).
- **Image Attachments**: Handled via `expo-image-picker` with compression through `expo-image-manipulator` before Supabase storage upload.
- **Answers & Voting**: Supports upvoting, downvoting, best answer selection by post author, and threaded nested replies.

### 3. Top Student & Reputation System

- Calculates student reputation based on questions answered, helpful votes, and best answers (`src/lib/ranking.ts` / `src/lib/topStudent.ts`).
- Displays special badges (`TopStudentBadge`) on profiles and next to author usernames.

### 4. Real-time Messaging

- Conversations mapped to either direct user pairing or questions.
- Messages sync in real-time via Supabase Postgres Changes subscription.
- Supports text, code snippets, and image attachments.

---

## 📋 Feature Status Checklist

### ✅ Completed

- [x] Base Expo SDK 54 configuration with TypeScript & Expo Router
- [x] Supabase integration with typed client, storage helper, and auth persistence
- [x] Auth flow (Login, Signup, Forgot Password)
- [x] Onboarding flow (University, Major, Year, GPA, Program selection)
- [x] Main 5-tab layout with custom icons and styling
- [x] Feed screen with filtering (All, Trending, Following, Unanswered)
- [x] Ask Question modal/screen with tags, code snippets, language picker, image uploads
- [x] Post detail view with answers list, upvoting, and best answer toggling
- [x] Explore tab (Search universities, courses, top students leaderboard)
- [x] University detail view
- [x] User public profile & Current user profile views
- [x] Settings & Theme toggle (Light/Dark mode)
- [x] Real-time 1-on-1 / linked chat messages screen & conversation list
- [x] Notifications screen with read/unread tracking

### 🔄 In Progress / Next Up

- [ ] Push notifications setup via Expo Notifications service (`expo-notifications`)
- [ ] Offline caching and optimistic UI improvements with TanStack React Query
- [ ] Enhanced search indexing & debounce optimization
- [ ] Moderation / Post reporting flow

---

## 📝 Conventions & Guidelines for Future Updates

1. **Expo SDK Versioning**: Always follow Expo v54 guidelines (see `AGENTS.md` and [Expo v54 docs](https://docs.expo.dev/versions/v54.0.0/)).
2. **Component Separation**:
   - Place generic UI atoms in `src/components/ui/`.
   - Place domain/screen-specific components in `src/components/features/`.
3. **State Management**:
   - **Server State**: Use React Query hooks inside `src/services/` or directly in screen components.
   - **Global Client State**: Use Zustand stores in `src/store/`.
4. **Styling & Theme**:
   - Use dynamic colors from `src/constants/theme.ts` via `useThemeStore` to ensure Dark/Light mode support.
5. **Updating this File**:
   - Whenever a new feature, database table, or major component is added, update the **Directory Structure**, **Key Systems**, and **Feature Status Checklist** above.
