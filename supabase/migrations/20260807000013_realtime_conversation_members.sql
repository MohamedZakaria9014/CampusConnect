-- Enable Realtime for conversation_members so client receives instant last_read_at updates
ALTER TABLE public.conversation_members REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'conversation_members'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
    END IF;
END
$$;
