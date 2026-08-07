import { supabase } from '../lib/supabase';
import { CommentAnswer } from '../types/models';
import { sortAnswers } from '../lib/ranking';

export async function fetchAnswersForPost(
  postId: string,
  sortBy: 'best' | 'upvoted' | 'top_students' | 'newest' = 'best'
): Promise<CommentAnswer[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles(*, university:universities(*))
    `)
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching answers from Supabase:', error.message);
    return [];
  }

  return sortAnswers((data || []) as CommentAnswer[], sortBy);
}

export async function createAnswer(answerData: Partial<CommentAnswer>): Promise<CommentAnswer> {
  const { data, error } = await supabase
    .from('comments')
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
    .select(`
      *,
      author:profiles(*, university:universities(*))
    `)
    .single();

  if (error) {
    console.error('Error creating answer in Supabase:', error.message);
    throw error;
  }

  return data as CommentAnswer;
}

export async function voteAnswer(commentId: string, userId: string, voteType: 1 | -1 | 0) {
  if (voteType === 0) {
    await supabase.from('comment_votes').delete().match({ comment_id: commentId, user_id: userId });
  } else {
    await supabase.from('comment_votes').upsert(
      { comment_id: commentId, user_id: userId, vote_type: voteType },
      { onConflict: 'comment_id,user_id' }
    );
  }
}

export async function markBestAnswer(postId: string, commentId: string) {
  await supabase.from('comments').update({ is_best_answer: false }).eq('post_id', postId);
  await supabase.from('comments').update({ is_best_answer: true }).eq('id', commentId);
  await supabase.from('posts').update({ is_solved: true }).eq('id', postId);
}
