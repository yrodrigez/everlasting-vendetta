CREATE OR REPLACE FUNCTION insert_login_if_not_exists(_member_id int)
    RETURNS void
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path TO public
AS $$
INSERT INTO login (member_id, created_at)
SELECT _member_id, NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM login
    WHERE member_id = _member_id
      AND created_at >= NOW() - INTERVAL '10 minutes'
);
$$;
