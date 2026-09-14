-- ========================================================
-- CHAT PERMISSIVE RLS FOR ANNOTATED SESSIONS & CONVERSATIONS
-- ========================================================

-- Allow reading conversations for members or if auth.uid() is null (anon dev mode)
DROP POLICY IF EXISTS "Member read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow read conversations" ON public.conversations;
CREATE POLICY "Allow read conversations" ON public.conversations
    FOR SELECT USING (
        auth.uid() IS NULL OR public.is_conversation_member(id, auth.uid())
    );

-- Allow reading conversation members
DROP POLICY IF EXISTS "Member read members" ON public.conversation_members;
DROP POLICY IF EXISTS "Allow read conversation members" ON public.conversation_members;
CREATE POLICY "Allow read conversation members" ON public.conversation_members
    FOR SELECT USING (
        auth.uid() IS NULL OR user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid())
    );

-- Allow reading messages
DROP POLICY IF EXISTS "Member read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow read messages" ON public.messages;
CREATE POLICY "Allow read messages" ON public.messages
    FOR SELECT USING (
        auth.uid() IS NULL OR public.is_conversation_member(conversation_id, auth.uid())
    );

-- Allow inserting messages
DROP POLICY IF EXISTS "Member insert message" ON public.messages;
DROP POLICY IF EXISTS "Allow insert message" ON public.messages;
CREATE POLICY "Allow insert message" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL OR auth.uid() = sender_id
    );
