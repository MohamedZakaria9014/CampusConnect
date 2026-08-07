import { supabase } from '../lib/supabase';
import { Post } from '../types/models';

export interface FetchPostsParams {
  category?: string;
  courseId?: string;
  universityId?: string;
  searchQuery?: string;
  filter?: 'all' | 'trending' | 'following' | 'unanswered';
  page?: number;
  limit?: number;
  userId?: string;
}

export async function fetchPosts(params: FetchPostsParams = {}): Promise<Post[]> {
  const { category, courseId, universityId, searchQuery, filter = 'all', page = 1, limit = 10, userId } = params;

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*, university:universities(*)),
      university:universities(*),
      course:courses(*)
    `);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  if (userId) {
    query = query.eq('author_id', userId);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  }

  if (filter === 'unanswered') {
    query = query.eq('answers_count', 0);
  } else if (filter === 'trending') {
    query = query.order('upvotes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts from Supabase:', error.message);
    throw error;
  }

  return (data || []) as Post[];
}

export async function fetchPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*, university:universities(*)),
      university:universities(*),
      course:courses(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching post by ID from Supabase:', error.message);
  }

  return data as Post | null;
}

export async function createPost(postData: Partial<Post>): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        author_id: postData.author_id,
        university_id: postData.university_id,
        course_id: postData.course_id,
        category: postData.category,
        title: postData.title,
        content: postData.content,
        code_snippet: postData.code_snippet,
        code_language: postData.code_language,
        image_urls: postData.image_urls || [],
        tags: postData.tags || [],
      },
    ])
    .select(`
      *,
      author:profiles(*, university:universities(*)),
      university:universities(*),
      course:courses(*)
    `)
    .single();

  if (error) {
    console.error('Error creating post in Supabase:', error.message);
    throw error;
  }

  return data as Post;
}

export async function togglePostLike(postId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  }
}

export async function toggleSavePost(postId: string, userId: string, currentlySaved: boolean) {
  if (currentlySaved) {
    await supabase.from('saved_posts').delete().match({ post_id: postId, user_id: userId });
  } else {
    await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId });
  }
}
