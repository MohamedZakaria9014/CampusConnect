import { supabase } from "../lib/supabase";
import { CommentAnswer } from "../types/models";
import { sortAnswers } from "../lib/ranking";

export async function fetchAnswersForPost(
  postId: string,
  sortBy: "best" | "upvoted" | "top_students" | "newest" = "best",
  currentUserId?: string,
): Promise<CommentAnswer[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      author:profiles(*, university:universities(*))
    `,
    )
    .eq("post_id", postId);

  if (error) {
    console.error("Error fetching answers from Supabase:", error.message);
    return [];
  }

  let answers = (data || []) as CommentAnswer[];

  if (currentUserId && answers.length > 0) {
    const commentIds = answers.map((a) => a.id);
    const { data: votesData } = await supabase
      .from("comment_votes")
      .select("comment_id, vote_type")
      .eq("user_id", currentUserId)
      .in("comment_id", commentIds);

    if (votesData && votesData.length > 0) {
      const voteMap = new Map(
        votesData.map((v) => [v.comment_id, v.vote_type]),
      );
      answers = answers.map((a) => ({
        ...a,
        user_vote: voteMap.get(a.id) || 0,
      }));
    }
  }

  return sortAnswers(answers, sortBy);
}

export async function createAnswer(
  answerData: Partial<CommentAnswer>,
): Promise<CommentAnswer> {
  if (!answerData.post_id || !answerData.author_id || !answerData.content) {
    throw new Error(
      "Missing required fields for answer (post_id, author_id, content)",
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert([
      {
        post_id: answerData.post_id,
        author_id: answerData.author_id,
        parent_comment_id: answerData.parent_comment_id,
        content: answerData.content,
        code_snippet: answerData.code_snippet,
        code_language: answerData.code_language,
        image_urls: answerData.image_urls || [],
      },
    ])
    .select(
      `
      *,
      author:profiles(*, university:universities(*))
    `,
    )
    .single();

  if (error) {
    console.error("Error creating answer in Supabase:", error.message);
    throw error;
  }

  return data as CommentAnswer;
}

export async function voteAnswer(
  commentId: string,
  userId: string,
  voteType: 1 | -1 | 0,
): Promise<void> {
  // Always remove existing vote first (compatible with existing DELETE RLS policy and trigger)
  const { error: delError } = await supabase
    .from("comment_votes")
    .delete()
    .match({ comment_id: commentId, user_id: userId });

  if (delError) {
    console.error("Error deleting answer vote:", delError.message);
    throw delError;
  }

  // If new vote is upvote (+1) or downvote (-1), insert it (compatible with existing INSERT RLS policy and trigger)
  if (voteType !== 0) {
    const { error: insError } = await supabase
      .from("comment_votes")
      .insert({ comment_id: commentId, user_id: userId, vote_type: voteType });

    if (insError) {
      console.error("Error inserting answer vote:", insError.message);
      throw insError;
    }
  }
}

export async function markBestAnswer(
  postId: string,
  commentId: string,
): Promise<void> {
  const { error: resetErr } = await supabase
    .from("comments")
    .update({ is_best_answer: false })
    .eq("post_id", postId);
  if (resetErr) {
    console.error("Error resetting best answers:", resetErr.message);
    throw resetErr;
  }

  const { error: markErr } = await supabase
    .from("comments")
    .update({ is_best_answer: true })
    .eq("id", commentId);
  if (markErr) {
    console.error("Error marking best answer:", markErr.message);
    throw markErr;
  }

  const { error: postErr } = await supabase
    .from("posts")
    .update({ is_solved: true })
    .eq("id", postId);
  if (postErr) {
    console.error("Error marking post solved:", postErr.message);
  }
}

export async function fetchAnswersForUser(
  userId: string,
): Promise<CommentAnswer[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("comments")
    .select(
      `
      *,
      author:profiles(*, university:universities(*)),
      post:posts(*, author:profiles(*, university:universities(*)))
    `,
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user answers from Supabase:", error.message);
    return [];
  }

  return (data || []) as CommentAnswer[];
}
