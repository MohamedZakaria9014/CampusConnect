import { supabase } from "../lib/supabase";
import { Profile } from "../types/models";

export async function getCurrentUserSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function fetchUserProfile(
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, university:universities(*)")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile from Supabase:", error.message);
  }

  return data as Profile | null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
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
    .eq("id", userId)
    .select("*, university:universities(*)")
    .single();

  if (error) {
    console.error("Error updating user profile in Supabase:", error.message);
    throw error;
  }

  return data as Profile;
}

export async function checkIsFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;
  const { data, error } = await supabase
    .from("followers")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) {
    console.error("Error checking follow status:", error.message);
    return false;
  }
  return !!data;
}

export async function toggleFollowUser(
  followerId: string,
  followingId: string,
  currentlyFollowing: boolean,
): Promise<boolean> {
  if (!followerId || !followingId || followerId === followingId) return false;

  if (currentlyFollowing) {
    const { error } = await supabase
      .from("followers")
      .delete()
      .match({ follower_id: followerId, following_id: followingId });

    if (error) {
      console.error("Error unfollowing user:", error.message);
      throw error;
    }
    return false;
  } else {
    const { error } = await supabase
      .from("followers")
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
      console.error("Error following user:", error.message);
      throw error;
    }
    return true;
  }
}
