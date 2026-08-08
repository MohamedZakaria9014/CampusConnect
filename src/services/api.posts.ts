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
      university:universities(*)
    `);

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  if (userId) {
    query = query.eq('author_id', userId);
  }

  if (searchQuery) {
    const q = searchQuery.trim();
    const { data: matchedUnis } = await supabase
      .from('universities')
      .select('id')
      .or(`name.ilike.%${q}%,short_name.ilike.%${q}%`);

    const matchedUniIds = matchedUnis?.map((u) => u.id) || [];

    if (matchedUniIds.length > 0) {
      query = query.or(
        `title.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%,course_code.ilike.%${q}%,code_language.ilike.%${q}%,university_id.in.(${matchedUniIds.join(',')})`
      );
    } else {
      query = query.or(
        `title.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%,course_code.ilike.%${q}%,code_language.ilike.%${q}%`
      );
    }
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
      university:universities(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching post by ID from Supabase:', error.message);
  }

  return data as Post | null;
}

export async function createPost(postData: Partial<Post>): Promise<Post> {
  const customCourse = postData.course_code?.trim();
  const postTags = [...(postData.tags || [])];
  if (customCourse && !postTags.includes(customCourse)) {
    postTags.unshift(customCourse);
  }

  const insertPayload = {
    author_id: postData.author_id,
    university_id: postData.university_id,
    course_code: customCourse || undefined,
    category: postData.category,
    title: postData.title,
    content: postData.content,
    code_snippet: postData.code_snippet,
    code_language: postData.code_language,
    image_urls: postData.image_urls || [],
    tags: postTags,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert([insertPayload])
    .select(`
      *,
      author:profiles(*, university:universities(*)),
      university:universities(*)
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

export async function fetchSavedPosts(userId: string): Promise<Post[]> {
  if (!userId) return [];
  const { data: savedRows, error: savedErr } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('user_id', userId);

  if (savedErr || !savedRows || savedRows.length === 0) return [];

  const postIds = savedRows.map((s) => s.post_id);
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles(*, university:universities(*)),
      university:universities(*),
      course:courses(*)
    `)
    .in('id', postIds)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as Post[];
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) {
    console.error('Error deleting post from Supabase:', error.message);
    throw error;
  }
}

