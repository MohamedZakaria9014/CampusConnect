-- ========================================================
-- DIRECT CONVERSATION ATOMIC RPC & CONVERSATIONS RLS POLICIES
-- ========================================================

-- Allow authenticated users to insert conversations
DROP POLICY IF EXISTS "Authenticated create conversation" ON public.conversations;
CREATE POLICY "Authenticated create conversation" ON public.conversations
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow anon users to create conversations (for dev / testing if session restores)
DROP POLICY IF EXISTS "Anon create conversation" ON public.conversations;
CREATE POLICY "Anon create conversation" ON public.conversations
    FOR INSERT TO anon WITH CHECK (true);

-- Atomic function to find or start a 1-on-1 direct conversation without RLS race condition
CREATE OR REPLACE FUNCTION public.start_direct_conversation(
    p_user_one UUID,
    p_user_two UUID,
    p_post_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conv_id UUID;
BEGIN
    -- Check if direct 1-on-1 conversation already exists between these two users
    SELECT cm1.conversation_id INTO v_conv_id
    FROM conversation_members cm1
    JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
    JOIN conversations c ON c.id = cm1.conversation_id
    WHERE cm1.user_id = p_user_one
      AND cm2.user_id = p_user_two
      AND c.is_group = FALSE
    LIMIT 1;

    IF v_conv_id IS NOT NULL THEN
        RETURN v_conv_id;
    END IF;

    -- Create new conversation
    INSERT INTO public.conversations (is_group, post_id, created_at, updated_at)
    VALUES (FALSE, p_post_id, NOW(), NOW())
    RETURNING id INTO v_conv_id;

    -- Add both participants as members in the same atomic transaction
    INSERT INTO public.conversation_members (conversation_id, user_id, last_read_at, created_at)
    VALUES 
        (v_conv_id, p_user_one, NOW(), NOW()),
        (v_conv_id, p_user_two, NOW(), NOW())
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    RETURN v_conv_id;
END;
$$;

-- Grant execution to authenticated and anon
GRANT EXECUTE ON FUNCTION public.start_direct_conversation(UUID, UUID, UUID) TO authenticated, anon;
