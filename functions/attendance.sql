DROP FUNCTION IF EXISTS raid_attendance(text);

CREATE OR REPLACE FUNCTION raid_attendance(character_name TEXT)
    RETURNS TABLE (
                      raid_name TEXT,
                      raid_date DATE,
                      participated BOOLEAN,
                      id TEXT
                  )
    LANGUAGE plpgsql
    SET search_path TO public
AS $$
BEGIN
    RETURN QUERY
        WITH the_character AS (
            SELECT m.*
            FROM ev_member m
            WHERE lower(m."character"->>'name') = lower(character_name)
            ORDER BY m.created_at DESC
            LIMIT 1
        ),
             relevant_members AS (
                 SELECT m.id
                 FROM the_character tc
                          JOIN ev_member m ON (
                     (tc.wow_account_id <> 0 AND m.wow_account_id = tc.wow_account_id)
                         OR (
                         tc.wow_account_id = 0
                             AND lower(m."character"->>'name') = lower(character_name)
                         )
                              OR (
                                  tc.character->>'name' = m.character->>'name'
                         )
                     )
             ),
             relevant_ids AS (
                 SELECT array_agg(rm.id) AS all_ids
                 FROM relevant_members rm
             ),
             valid_resets AS (
                 SELECT
                     rs.id,
                     rs.name AS raid_name,
                     rs.raid_date,
                     rs.time AS raid_time
                 FROM raid_resets rs
                          JOIN ev_raid r ON r.id = rs.raid_id
                 WHERE (
                           SELECT COUNT(*)
                           FROM ev_raid_participant rp
                           WHERE rp.raid_id = rs.id
                             AND (
                               CASE
                                   WHEN rp.details->>'status' IS NOT NULL
                                       THEN (rp.details->>'status') = 'confirmed'
                                   ELSE rp.is_confirmed
                                   END
                               )
                       ) >= r.size * 0.5
                   AND COALESCE(rs.status, '') != 'cancelled'
                   AND rs.end_date < current_date - interval '12 hours'
             )
        SELECT
            vr.raid_name,
            vr.raid_date,
            (
                SELECT COUNT(1) > 0
                FROM ev_raid_participant rp
                WHERE rp.raid_id = vr.id
                  AND (
                    CASE
                        WHEN rp.details->>'status' IS NOT NULL
                            THEN (rp.details->>'status') = 'confirmed'
                        ELSE rp.is_confirmed
                        END
                    )
                  AND rp.member_id = ANY(ri.all_ids)
            ) AS participated,
            vr.id::text AS id
        FROM valid_resets vr
                 CROSS JOIN relevant_ids ri
        ORDER BY (vr.raid_date::TEXT || ' ' || vr.raid_time::TEXT)::TIMESTAMP;
END;
$$;
