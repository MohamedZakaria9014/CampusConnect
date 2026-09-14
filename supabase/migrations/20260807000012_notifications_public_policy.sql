-- Ensure notifications can be read and inserted by public/authenticated
DROP POLICY IF EXISTS "User read notifications" ON public.notifications;
CREATE POLICY "User read notifications" ON public.notifications
    FOR SELECT TO public
    USING (auth.uid() IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System insert notification" ON public.notifications;
CREATE POLICY "Allow insert notifications" ON public.notifications
    FOR INSERT TO public
    WITH CHECK (true);

-- Ensure conversation_members can be updated by public
DROP POLICY IF EXISTS "Allow update conversation members" ON public.conversation_members;
CREATE POLICY "Allow update conversation members" ON public.conversation_members
    FOR UPDATE TO public
    USING (true)
    WITH CHECK (true);
