DROP FUNCTION IF EXISTS get_member_profession_spell_count();

CREATE OR REPLACE FUNCTION get_member_profession_spell_count()
    RETURNS TABLE (
                      member_name TEXT,
                      profession_name TEXT,
                      spell_count BIGINT
                  )
    LANGUAGE plpgsql
    SET search_path TO public
AS $$
BEGIN
    RETURN QUERY
        SELECT
            m.character->>'name' AS member_name,
            p.name AS profession_name,
            COUNT(mps.id) AS spell_count
        FROM member_profession_spells mps
                 JOIN ev_member m ON m.id = mps.member_id
                 JOIN professions p ON p.id = mps.profession_id
        GROUP BY member_name, profession_name
        ORDER BY spell_count DESC;
END;
$$;
