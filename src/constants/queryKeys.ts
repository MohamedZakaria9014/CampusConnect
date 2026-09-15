/**
 * Centralized Query Key Factory following TanStack Query v5 best practices.
 * Ensures consistent cache invalidation, optimistic updates, and prefetching.
 */

export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    lists: () => [...queryKeys.posts.all, "list"] as const,
    list: (
      category?: string,
      filter?: string,
      userId?: string,
      universityId?: string,
    ) =>
      [
        ...queryKeys.posts.lists(),
        { category, filter, userId, universityId },
      ] as const,
    details: () => [...queryKeys.posts.all, "detail"] as const,
    detail: (id: string, userId?: string) =>
      [...queryKeys.posts.details(), id, { userId }] as const,
    searches: () => [...queryKeys.posts.all, "search"] as const,
    search: (query: string) => [...queryKeys.posts.searches(), query] as const,
    bySubject: (subject: string) =>
      [...queryKeys.posts.all, "subject", subject] as const,
    byUniversity: (uniId: string) =>
      [...queryKeys.posts.all, "university", uniId] as const,
    userPosts: (userId: string) =>
      [...queryKeys.posts.all, "user", userId] as const,
    userSaved: (userId: string) =>
      [...queryKeys.posts.all, "saved", userId] as const,
  },
  answers: {
    all: ["answers"] as const,
    byPost: (postId: string, sort?: string, userId?: string) =>
      [...queryKeys.answers.all, postId, { sort, userId }] as const,
    userAnswers: (userId: string) =>
      [...queryKeys.answers.all, "user", userId] as const,
  },
  universities: {
    all: ["universities"] as const,
    detail: (id: string) => [...queryKeys.universities.all, id] as const,
  },
  majors: {
    all: ["majors"] as const,
  },
  users: {
    all: ["users"] as const,
    profile: (userId?: string) =>
      [...queryKeys.users.all, "profile", userId] as const,
    topStudents: (universityId?: string) =>
      [...queryKeys.users.all, "topStudents", { universityId }] as const,
    search: (query: string) =>
      [...queryKeys.users.all, "search", query] as const,
    following: (targetId: string, currentUserId?: string) =>
      [
        ...queryKeys.users.all,
        "following",
        targetId,
        { currentUserId },
      ] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (userId?: string) =>
      [...queryKeys.notifications.all, userId] as const,
  },
  chat: {
    all: ["chat"] as const,
    conversations: (userId?: string) =>
      [...queryKeys.chat.all, "conversations", userId] as const,
    messages: (conversationId: string) =>
      [...queryKeys.chat.all, "messages", conversationId] as const,
  },
  explore: {
    all: ["explore"] as const,
    trending: () => [...queryKeys.explore.all, "trending"] as const,
  },
};
