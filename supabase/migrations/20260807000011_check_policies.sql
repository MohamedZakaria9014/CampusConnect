CREATE OR REPLACE FUNCTION public.get_table_policies(p_table TEXT)
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    policyname TEXT,
    permissive TEXT,
    roles NAME[],
    cmd TEXT,
    qual TEXT,
    with_check TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        schemaname::TEXT,
        tablename::TEXT,
        policyname::TEXT,
        permissive::TEXT,
        roles,
        cmd::TEXT,
        qual::TEXT,
        with_check::TEXT
    FROM pg_policies
    WHERE tablename = p_table;
$$;

GRANT EXECUTE ON FUNCTION public.get_table_policies(TEXT) TO authenticated, anon;
