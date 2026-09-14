import { supabase } from '../lib/supabase';
import { University, Profile, Course } from '../types/models';
import { CAMPUS_MAJORS, CampusMajor } from '../constants/majors';

export type Major = CampusMajor;

export async function fetchUniversities(): Promise<University[]> {
  const { data, error } = await supabase.from('universities').select('*').order('name');
  if (error) {
    console.error('Error fetching universities from Supabase:', error.message);
    return [];
  }
  return (data || []) as University[];
}

export async function fetchMajors(): Promise<Major[]> {
  try {
    const { data, error } = await supabase.from('majors').select('*').order('name');
    if (!error && data && data.length > 0) {
      return data as Major[];
    }
  } catch (err) {
    console.warn('Could not fetch majors from Supabase, using local constants fallback:', err);
  }
  return CAMPUS_MAJORS;
}

export async function fetchCourses(universityId?: string): Promise<Course[]> {
  // Courses were normalized into posts.course_code in database migration 6.
  // Extract distinct course codes from existing posts to populate subjects filter.
  try {
    let query = supabase.from('posts').select('course_code, university_id').not('course_code', 'is', null);
    if (universityId) {
      query = query.eq('university_id', universityId);
    }
    const { data, error } = await query;
    if (error || !data) return [];
    const uniqueCodes = Array.from(new Set(data.map((p) => p.course_code).filter(Boolean))) as string[];
    return uniqueCodes.map((code) => ({
      id: code,
      code,
      name: code,
      department: 'Academic',
      university_id: universityId || '',
    }));
  } catch {
    return [];
  }
}

export async function searchStudents(queryStr: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, university:universities(*)')
    .or(`full_name.ilike.%${queryStr}%,username.ilike.%${queryStr}%,major.ilike.%${queryStr}%`)
    .limit(20);

  if (error) {
    console.error('Error searching students from Supabase:', error.message);
    return [];
  }
  return (data || []) as Profile[];
}

export async function fetchTopStudents(universityId?: string): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*, university:universities(*)')
    .eq('is_top_student', true)
    .order('reputation', { ascending: false })
    .limit(10);

  if (universityId) {
    query = query.eq('university_id', universityId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching top students from Supabase:', error.message);
    return [];
  }
  return (data || []) as Profile[];
}

export interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  count: string;
  score: number;
  isTopStudent: boolean;
  authorName?: string;
  postId?: string;
}

export async function fetchTrendingTopics(): Promise<TrendingTopic[]> {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id, title, category, course_code, upvotes_count, answers_count, views_count, created_at, profiles(full_name, is_top_student, reputation)')
      .limit(50);

    if (error || !posts || posts.length === 0) {
      return [
        {
          id: 't-1',
          title: 'Stokes Theorem & Surface Integrals',
          category: 'Mathematics',
          count: '142 questions · Top Student verified',
          score: 200,
          isTopStudent: true,
          authorName: 'Omar Hassan',
        },
        {
          id: 't-2',
          title: 'Dijkstra vs A* Algorithm C++',
          category: 'Programming',
          count: '98 questions · 24 upvotes',
          score: 150,
          isTopStudent: false,
          authorName: 'Sara Ahmed',
        },
        {
          id: 't-3',
          title: 'Maxwell Equations Dielectric Boundary',
          category: 'Physics',
          count: '64 questions · 12 answers',
          score: 110,
          isTopStudent: false,
        },
        {
          id: 't-4',
          title: 'Organic Chemistry Synthesis Mechanisms',
          category: 'Chemistry',
          count: '51 questions · Top Student verified',
          score: 95,
          isTopStudent: true,
        },
      ];
    }

    // Rank topics by real algorithm: views + (upvotes * 5) + (answers * 10) + (is_top_student ? 100 : 0)
    const ranked = posts.map((p: any) => {
      const upvotes = p.upvotes_count || 0;
      const answers = p.answers_count || 0;
      const views = p.views_count || 0;
      const authorProfile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
      const isTop = !!authorProfile?.is_top_student;
      const rep = authorProfile?.reputation || 0;
      const score = views + upvotes * 5 + answers * 10 + (isTop ? 100 : 0) + Math.min(rep, 50);

      const countText = isTop
        ? `⭐ Top Student (${authorProfile?.full_name || 'Scholar'}) · ${upvotes} upvotes`
        : `${answers} answers · ${views} views`;

      return {
        id: p.id,
        title: p.title,
        category: p.category || p.course_code || 'Academic',
        count: countText,
        score,
        isTopStudent: isTop,
        authorName: authorProfile?.full_name,
        postId: p.id,
      };
    });

    ranked.sort((a, b) => b.score - a.score);
    return ranked.slice(0, 8);
  } catch (err) {
    console.error('Error fetching trending topics:', err);
    return [];
  }
}
