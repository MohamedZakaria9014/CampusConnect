import { supabase } from '../lib/supabase';
import { Profile } from '../types/models';

export async function getCurrentUserSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function fetchUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, university:universities(*)')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile from Supabase:', error.message);
  }

  return data as Profile | null;
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name,
      username: updates.username,
      university_id: updates.university_id,
      major: updates.major,
      program: updates.program,
      year: updates.year,
      semester: updates.semester,
      gpa: updates.gpa,
      bio: updates.bio,
      avatar_url: updates.avatar_url,
    })
    .eq('id', userId)
    .select('*, university:universities(*)')
    .single();

  if (error) {
    console.error('Error updating user profile in Supabase:', error.message);
    throw error;
  }

  return data as Profile;
}
