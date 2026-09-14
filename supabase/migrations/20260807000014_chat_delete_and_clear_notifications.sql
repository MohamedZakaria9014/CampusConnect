-- ========================================================
-- CHAT DELETION & NOTIFICATION CLEARING
-- ========================================================

-- 1. Policies to allow deleting notifications
DROP POLICY IF EXISTS "Allow delete notifications" ON public.notifications;
CREATE POLICY "Allow delete notifications" ON public.notifications
    FOR DELETE TO authenticated, anon
    USING (true);

-- 2. Policies to allow deleting conversation members
DROP POLICY IF EXISTS "Allow delete conversation members" ON public.conversation_members;
CREATE POLICY "Allow delete conversation members" ON public.conversation_members
    FOR DELETE TO authenticated, anon
    USING (true);

-- 3. Policies to allow deleting conversations
DROP POLICY IF EXISTS "Allow delete conversations" ON public.conversations;
CREATE POLICY "Allow delete conversations" ON public.conversations
    FOR DELETE TO authenticated, anon
    USING (true);

-- 4. Atomic function to delete conversation and all related messages
CREATE OR REPLACE FUNCTION public.delete_conversation(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow if the requesting user is a member of the conversation
    IF EXISTS (
        SELECT 1 FROM public.conversation_members
        WHERE conversation_id = p_conversation_id AND user_id = p_user_id
    ) THEN
        DELETE FROM public.conversations WHERE id = p_conversation_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_conversation(UUID, UUID) TO authenticated, anon;

-- 5. Atomic function to clear all notifications for a user
CREATE OR REPLACE FUNCTION public.clear_user_notifications(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.notifications WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.clear_user_notifications(UUID) TO authenticated, anon;

-- 6. Atomic function to delete a single notification
CREATE OR REPLACE FUNCTION public.delete_notification(
    p_notification_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.notifications 
    WHERE id = p_notification_id AND user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_notification(UUID, UUID) TO authenticated, anon;
