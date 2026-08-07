import { supabase } from '../lib/supabase';
import { University, Course, Profile } from '../types/models';

export interface Major {
  id: string;
  name: string;
  category: string;
}

export async function fetchUniversities(): Promise<University[]> {
  const { data, error } = await supabase.from('universities').select('*').order('name');
  if (error) {
    console.error('Error fetching universities from Supabase:', error.message);
    return [];
  }
  return (data || []) as University[];
}

export async function fetchMajors(): Promise<Major[]> {
  const { data, error } = await supabase.from('majors').select('*').order('name');
  if (error) {
    console.error('Error fetching majors from Supabase:', error.message);
    return [];
  }
  return (data || []) as Major[];
}

export async function fetchCourses(universityId?: string): Promise<Course[]> {
  let query = supabase.from('courses').select('*, university:universities(*)');
  if (universityId) {
    query = query.eq('university_id', universityId);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching courses from Supabase:', error.message);
    return [];
  }
  return (data || []) as Course[];
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
