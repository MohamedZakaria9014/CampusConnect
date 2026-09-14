-- ========================================================
-- FIX CHAT READ RECEIPTS, UNREAD COUNTS, AND NOTIFICATIONS
-- ========================================================

-- 1. Fix notifications type check constraint to include 'new_post'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('new_answer', 'new_comment', 'answer_upvoted', 'answer_best', 'new_message', 'mention', 'new_follower', 'badge_earned', 'new_post'));

-- 2. Allow inserting notifications (for new_message and new_post)
DROP POLICY IF EXISTS "System insert notification" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;
CREATE POLICY "Allow insert notifications" ON public.notifications
    FOR INSERT TO authenticated, anon
    WITH CHECK (true);

-- 3. Allow updating conversation_members (specifically last_read_at for read receipts)
DROP POLICY IF EXISTS "Allow update conversation members" ON public.conversation_members;
CREATE POLICY "Allow update conversation members" ON public.conversation_members
    FOR UPDATE TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 4. Atomic function to mark conversation as read
CREATE OR REPLACE FUNCTION public.mark_conversation_read(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.conversation_members
    SET last_read_at = NOW()
    WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID, UUID) TO authenticated, anon;

-- 5. Atomic function to dispatch notification
CREATE OR REPLACE FUNCTION public.send_notification(
    p_user_id UUID,
    p_actor_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_body TEXT,
    p_post_id UUID DEFAULT NULL,
    p_conversation_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, actor_id, type, title, body, post_id, conversation_id, created_at, is_read)
    VALUES (p_user_id, p_actor_id, p_type, p_title, p_body, p_post_id, p_conversation_id, NOW(), FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_notification(UUID, UUID, TEXT, TEXT, TEXT, UUID, UUID) TO authenticated, anon;
