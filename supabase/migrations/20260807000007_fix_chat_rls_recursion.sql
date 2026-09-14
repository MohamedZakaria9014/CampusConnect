-- ========================================================
-- FIX CHAT RLS RECURSION MIGRATION
-- ========================================================

-- Helper function with SECURITY DEFINER to bypass RLS and break infinite recursion
CREATE OR REPLACE FUNCTION public.is_conversation_member(p_conv_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_members
    WHERE conversation_id = p_conv_id AND user_id = p_user_id
  );
$$;

-- Drop old recursive policies
DROP POLICY IF EXISTS "Member read members" ON public.conversation_members;
DROP POLICY IF EXISTS "Member insert member" ON public.conversation_members;
DROP POLICY IF EXISTS "Member read conversations" ON public.conversations;
DROP POLICY IF EXISTS "Member read messages" ON public.messages;
DROP POLICY IF EXISTS "Member insert message" ON public.messages;

-- Recreate policies without recursion using the SECURITY DEFINER function
CREATE POLICY "Member read members" ON public.conversation_members
    FOR SELECT USING (
        user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid())
    );

CREATE POLICY "Member insert member" ON public.conversation_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR public.is_conversation_member(conversation_id, auth.uid())
    );

CREATE POLICY "Member read conversations" ON public.conversations
    FOR SELECT USING (
        public.is_conversation_member(id, auth.uid())
    );

CREATE POLICY "Member read messages" ON public.messages
    FOR SELECT USING (
        public.is_conversation_member(conversation_id, auth.uid())
    );

CREATE POLICY "Member insert message" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND public.is_conversation_member(conversation_id, auth.uid())
    );
