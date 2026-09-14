import { supabase } from '../lib/supabase';
import { Post } from '../types/models';

export interface FetchPostsParams {
  category?: string;
  courseId?: string;
  universityId?: string;
  searchQuery?: string;
  subject?: string;
  filter?: 'all' | 'trending' | 'following' | 'unanswered';
  page?: number;
  limit?: number;
  userId?: string;
  currentUserId?: string;
}

export async function fetchPosts(params: FetchPostsParams = {}): Promise<Post[]> {
  const {
    category,
    courseId,
    universityId,
    searchQuery,
    subject,
    filter = 'all',
    page = 1,
    limit = 10,
    userId,
    currentUserId,
  } = params;

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

  if (courseId) {
    query = query.eq('course_code', courseId);
  }

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  if (userId) {
    query = query.eq('author_id', userId);
  }

  if (subject) {
    const s = subject.trim();
    const keywords = s.split(/[\s&/,\-]+/).filter((k) => k.length > 2);
    const conditions = [
      `category.ilike.%${s}%`,
      `course_code.ilike.%${s}%`,
      `title.ilike.%${s}%`,
      `content.ilike.%${s}%`,
    ];
    for (const kw of keywords) {
      conditions.push(`category.ilike.%${kw}%`);
      conditions.push(`course_code.ilike.%${kw}%`);
      conditions.push(`title.ilike.%${kw}%`);
    }
    const lowerS = s.toLowerCase();
    if (lowerS.includes('computer') || lowerS.includes('software') || lowerS.includes('cyber')) {
      conditions.push('category.ilike.%Programming%');
      conditions.push('course_code.ilike.%CS%');
    } else if (lowerS.includes('math')) {
      conditions.push('category.ilike.%Mathematics%');
      conditions.push('course_code.ilike.%MATH%');
    } else if (lowerS.includes('phys')) {
      conditions.push('category.ilike.%Physics%');
      conditions.push('course_code.ilike.%PHYS%');
    } else if (lowerS.includes('chem')) {
      conditions.push('category.ilike.%Chemistry%');
      conditions.push('course_code.ilike.%CHEM%');
    } else if (lowerS.includes('med') || lowerS.includes('pharm') || lowerS.includes('dent') || lowerS.includes('nurs')) {
      conditions.push('category.ilike.%Medicine%');
    } else if (lowerS.includes('business') || lowerS.includes('fin') || lowerS.includes('econ') || lowerS.includes('mkt')) {
      conditions.push('category.ilike.%Business%');
    } else if (lowerS.includes('engineer')) {
      conditions.push('category.ilike.%Engineering%');
    }
    query = query.or(Array.from(new Set(conditions)).join(','));
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

  const posts = (data || []) as Post[];

  // Augment with is_upvoted and is_saved for the current user
  if (currentUserId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const [likesRes, savedRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
      supabase.from('saved_posts').select('post_id').eq('user_id', currentUserId).in('post_id', postIds),
    ]);

    const likedSet = new Set(likesRes.data?.map((l) => l.post_id) || []);
    const savedSet = new Set(savedRes.data?.map((s) => s.post_id) || []);

    return posts.map((p) => ({
      ...p,
      is_upvoted: likedSet.has(p.id),
      is_saved: savedSet.has(p.id),
    }));
  }

  return posts;
}

export async function fetchPostById(id: string, currentUserId?: string): Promise<Post | null> {
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
    return null;
  }

  if (!data) return null;

  const post = data as Post;

  if (currentUserId) {
    const [likeRes, saveRes] = await Promise.all([
      supabase.from('post_likes').select('post_id').eq('user_id', currentUserId).eq('post_id', id).maybeSingle(),
      supabase.from('saved_posts').select('post_id').eq('user_id', currentUserId).eq('post_id', id).maybeSingle(),
    ]);

    post.is_upvoted = !!likeRes.data;
    post.is_saved = !!saveRes.data;
  }

  return post;
}

export async function createPost(postData: Partial<Post>): Promise<Post> {
  if (!postData.author_id || !postData.title || !postData.content || !postData.category) {
    throw new Error('Missing required fields for post (author_id, title, content, category)');
  }

  const customCourse = postData.course_code?.trim();
  const postTags = [...(postData.tags || [])];
  if (customCourse && !postTags.includes(customCourse)) {
    postTags.unshift(customCourse);
  }

  const insertPayload = {
    author_id: postData.author_id,
    university_id: postData.university_id || null,
    course_code: customCourse || null,
    category: postData.category,
    title: postData.title,
    content: postData.content,
    code_snippet: postData.code_snippet || null,
    code_language: postData.code_language || null,
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

  // Notify all followers when an author drops a new post
  try {
    const { data: followers } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', postData.author_id);

    if (followers && followers.length > 0 && postData.author_id) {
      const authorId = postData.author_id;
      let authorName = 'A classmate you follow';
      const { data: authorProf } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authorId)
        .maybeSingle();
      if (authorProf?.full_name) {
        authorName = authorProf.full_name;
      }

      for (const f of followers) {
        try {
          await (supabase.rpc as any)('send_notification', {
            p_user_id: f.follower_id,
            p_actor_id: authorId,
            p_type: 'new_post',
            p_title: `${authorName} dropped a new post`,
            p_body: postData.title || 'Tap to view the new question',
            p_post_id: data.id,
            p_conversation_id: null,
          });
        } catch {
          await supabase.from('notifications').insert([{
            user_id: f.follower_id,
            actor_id: authorId,
            type: 'new_post' as const,
            post_id: data.id,
            title: `${authorName} dropped a new post`,
            body: postData.title || 'Tap to view the new question',
          }]);
        }
      }
    }
  } catch (notifErr) {
    console.warn('Could not notify followers of new post:', notifErr);
  }

  return data as Post;
}

export async function togglePostLike(postId: string, userId: string, currentlyLiked: boolean): Promise<boolean> {
  if (currentlyLiked) {
    const { error } = await supabase.from('post_likes').delete().match({ post_id: postId, user_id: userId });
    if (error) {
      console.error('Error removing post like:', error.message);
      throw error;
    }
    return false;
  } else {
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    if (error) {
      console.error('Error adding post like:', error.message);
      throw error;
    }
    return true;
  }
}

export async function toggleSavePost(postId: string, userId: string, currentlySaved: boolean): Promise<boolean> {
  if (currentlySaved) {
    const { error } = await supabase.from('saved_posts').delete().match({ post_id: postId, user_id: userId });
    if (error) {
      console.error('Error unsaving post:', error.message);
      throw error;
    }
    return false;
  } else {
    const { error } = await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId });
    if (error) {
      console.error('Error saving post:', error.message);
      throw error;
    }
    return true;
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

