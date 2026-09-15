-- Migration: Add UPDATE policy for comment_votes
CREATE POLICY "User update comment vote" 
ON public.comment_votes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
