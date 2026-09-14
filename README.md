# CampusConnect 🎓

> **A high-performance academic Q&A and student networking platform built for university communities.**
> Inspired by Stack Overflow and Reddit, engineered with modern React Native best practices.

---

## 🚀 Overview

**CampusConnect** is a mobile application tailored specifically for university students, teaching assistants, and campus study groups. It bridges the gap between casual campus group chats and structured technical Q&A, offering:

- **Academic Discussion & Q&A**: Syntax-highlighted code blocks, course-specific tagging, accepted solutions, and multi-image attachments for homework equations/diagrams.
- **Peer Recognition & Reputation**: Dynamic reputation points, Top Student / Dean's List badges, verified university affiliation, and campus leaderboards.
- **Real-Time Direct Messaging**: Low-latency 1-on-1 student chat with inline code snippets and image attachments powered by Supabase Realtime.
- **Multi-University Discovery**: Debounced search across institutions, courses, peer profiles, and course questions.

---

## 🛠 Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [Expo SDK 57](https://expo.dev) + [React Native 0.86](https://reactnative.dev) |
| **Runtime** | [React 19](https://react.dev) with React Compiler optimizations |
| **Navigation** | [Expo Router v4](https://docs.expo.dev/router/introduction/) (File-based, typed routing) |
| **Backend & DB** | [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, Realtime, Storage) |
| **Server State** | [TanStack React Query v5](https://tanstack.com/query/latest) (Optimistic updates, cache invalidation) |
| **Client State** | [Zustand](https://github.com/pmndrs/zustand) (Persistent auth session & dark/light theme) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) schemas |
| **Media Pipeline** | [Expo Image Manipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) (Client-side compression before cloud upload) |
| **Icons & UI** | [Lucide React Native](https://lucide.dev) + [React Native SVG](https://github.com/software-mansion/react-native-svg) |

---

## 🏗 Architecture & Engineering Highlights

### 1. Robust Optimistic UI with Error Rollback
Upvoting questions and answers utilizes **derived optimistic state** (`optimisticState !== null ? optimisticState : serverState`). This pattern:
- Eliminates synchronous `setState` inside `useEffect` (preventing React 19 / React Compiler re-render loops).
- Instantly reflects UI feedback to the user.
- Rolls back gracefully with an Alert dialog if network requests fail.
- Implements strict authentication guards preventing unauthenticated mutations.

### 2. Low-Latency Real-Time Chat & Direct UUID Messaging
- Direct messaging auto-discovers or provisions persistent Supabase `conversations` records (preventing synthetic key collisions).
- Subscribes to PostgreSQL row inserts via `supabase.channel('messages:conv_id')`.
- Handles binary image upload to Supabase Storage before broadcasting messages.

### 3. Debounced Search Optimization
- Custom `useDebounce` hook buffers university, course, and user queries by 300ms, eliminating redundant backend RPC calls and database thrashing during rapid typing.

### 4. Client-Side Image Compression Pipeline
- Before uploading images (equations, handwritten notes, profile avatars) to Supabase Storage, images are automatically resized and compressed down to 80% JPEG quality, minimizing bandwidth consumption and storage latency on cellular connections.

---

## 🗄 Database Model (Supabase)

```
universities (id, name, short_name, domain, logo_url)
├── courses (id, university_id, code, name, department)
└── profiles (id, university_id, full_name, username, major, year, gpa, reputation, is_top_student)
    ├── posts (id, author_id, university_id, course_code, category, title, content, code_snippet, is_solved)
    │   ├── comments (id, post_id, author_id, content, code_snippet, is_accepted)
    │   │   └── comment_votes (id, comment_id, user_id, vote_type)
    │   ├── post_likes (id, post_id, user_id)
    │   └── saved_posts (id, post_id, user_id)
    ├── conversations (id, created_at)
    │   ├── conversation_members (id, conversation_id, user_id)
    │   └── messages (id, conversation_id, sender_id, content, code_snippet, image_url)
    ├── notifications (id, user_id, actor_id, type, post_id, title, body, is_read)
    ├── followers (id, follower_id, following_id)
    └── user_badges (id, user_id, badge_id)
```

---

## 💻 Getting Started

### Prerequisites
- Node.js >= 18
- npm or yarn
- Expo Go or an Android/iOS emulator

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/your-username/CampusConnect.git
cd CampusConnect/campus-connect

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Create a .env file in the root with your Supabase credentials:
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Running the App
```bash
# Start the Expo development server with clear cache
npx expo start -c
```

### Verification & Health Checks
```bash
# Type check TypeScript
npx tsc --noEmit

# Lint check codebase
npx eslint .

# Expo SDK 57 doctor diagnostic
npx expo-doctor
```

---

## 📱 Core User Flows

1. **Authentication & Campus Affiliation**:
   - Email/password authentication via Supabase Auth.
   - Onboarding flow collecting University, Major, Academic Year, and GPA.
2. **Academic Feed & Search**:
   - Browse university-filtered questions, filter by academic categories (*Programming*, *Mathematics*, *Physics*, *Engineering*).
   - Instant search with 300ms debouncing.
   - Upvote, save, and share questions.
3. **Submitting Solutions**:
   - Post questions with syntax-highlighted code and photo attachments.
   - Answer peer questions; original posters can accept solutions to award reputation points.
4. **Peer Connection**:
   - Follow peers, view top students and badges, initiate direct real-time chat.
