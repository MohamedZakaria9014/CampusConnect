export interface University {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  banner_url?: string;
  location?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  university_id: string;
  code: string;
  name: string;
  department: string;
  created_at?: string;
  university?: University;
}

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  university_id?: string;
  major?: string;
  program?: string;
  year?: string;
  semester?: number;
  gpa?: number;
  bio?: string;
  is_top_student: boolean;
  reputation: number;
  questions_count: number;
  answers_count: number;
  helpful_answers_count: number;
  best_answers_count: number;
  followers_count: number;
  following_count: number;
  created_at?: string;
  updated_at?: string;
  university?: University;
  is_following?: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  university_id?: string;
  course_code?: string;
  category: string;
  title: string;
  content: string;
  code_snippet?: string;
  code_language?: string;
  image_urls?: string[];
  tags?: string[];
  upvotes_count: number;
  answers_count: number;
  views_count: number;
  is_solved: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  university?: University;
  is_upvoted?: boolean;
  is_saved?: boolean;
}

export interface CommentAnswer {
  id: string;
  post_id: string;
  author_id: string;
  parent_comment_id?: string;
  content: string;
  code_snippet?: string;
  code_language?: string;
  image_urls?: string[];
  upvotes_count: number;
  is_best_answer: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  post?: Post;
  user_vote?: number; // 1, -1, or 0
  replies?: CommentAnswer[];
}

export interface Conversation {
  id: string;
  is_group: boolean;
  name?: string;
  post_id?: string;
  created_at: string;
  updated_at: string;
  members?: Profile[];
  last_message?: Message;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  image_url?: string;
  code_snippet?: string;
  code_language?: string;
  created_at: string;
  sender?: Profile;
  is_pending?: boolean;
  has_error?: boolean;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'new_answer' | 'new_comment' | 'answer_upvoted' | 'answer_best' | 'new_message' | 'mention' | 'new_follower' | 'badge_earned';
  post_id?: string;
  comment_id?: string;
  conversation_id?: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
  post?: Post;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  color: string;
  earned_at?: string;
}

export type AnswerSortOption = 'best' | 'upvoted' | 'top_students' | 'newest';
export type FeedFilterOption = 'all' | 'trending' | 'following' | 'unanswered';
