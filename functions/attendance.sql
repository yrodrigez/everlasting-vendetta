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
        /*
          1) Identify exactly one 'primary' member for the given character_name
             (case-insensitive).  If multiple rows share that name, pick one.
             Adjust ORDER BY / LIMIT logic as you see fit.
        */
        WITH the_character AS (
            SELECT m.*
            FROM ev_member m
            WHERE lower(m."character"->>'name') = lower(character_name)
            ORDER BY m.id
            LIMIT 1
        ),

            /*
              2) If wow_account_id != 0, gather *all* member IDs that share that wow_account_id.
                 Otherwise (wow_account_id = 0), only include members with the exact same name.
            */
             relevant_members AS (
                 SELECT m.id
                 FROM the_character tc
                          JOIN ev_member m ON (
                     (tc.wow_account_id <> 0 AND m.wow_account_id = tc.wow_account_id)
                         OR (
                         tc.wow_account_id = 0
                             AND lower(m."character"->>'name') = lower(character_name)
                         )
                     )
             ),

            /*
              3) Convert those relevant member IDs into an array for easy checking.
            */
             relevant_ids AS (
                 SELECT array_agg(rm.id) AS all_ids
                 FROM relevant_members rm
             ),

            /*
              4) valid_resets: each raid reset that is "valid" if at least half the
                 participants are "confirmed" by either rp.details->>'status' = 'confirmed'
                 OR rp.is_confirmed = true (fallback).
            */
             valid_resets AS (
                 SELECT
                     rs.id,
                     rs.name AS raid_name,
                     rs.raid_date
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
             )

        /*
          5) For each valid raid, mark participated=TRUE if ANY of those relevant IDs has
             a participant row that is "confirmed" by the same logic.
        */
        SELECT
            vr.raid_name,
            vr.raid_date,
            (
                SELECT COUNT(*) > 0
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
                 -- CROSS JOIN to get the array of all relevant IDs
                 CROSS JOIN relevant_ids ri
        ORDER BY vr.raid_date;
END;
$$;
