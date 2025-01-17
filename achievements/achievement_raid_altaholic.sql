create or replace function achievement_raid_altaholic(character_name text)
    returns TABLE(achieved boolean, progress numeric)
    language plpgsql
as
$$
BEGIN
RETURN QUERY
    WITH main_character AS (
        SELECT wow_account_id
        FROM ev_member
        WHERE character ->> 'name' = character_name
          AND character -> 'guild' ->> 'name' = 'Everlasting Vendetta'
          AND wow_account_id <> 0
        LIMIT 1
    ),
         alts AS (
             SELECT
                 m.wow_account_id AS account_id,
                 COUNT(DISTINCT m.character ->> 'name') AS alt_count
             FROM ev_member m
                      JOIN raid_loot_reservation rlr ON rlr.member_id = m.id
                      JOIN raid_resets rr ON rr.id = rlr.reset_id
                      JOIN ev_loot_history lh ON lh.character = m.character ->> 'name'
             WHERE m.character -> 'guild' ->> 'name' = 'Everlasting Vendetta'
               AND wow_account_id <> 0
               AND m.character ->> 'name' <> character_name
             GROUP BY m.wow_account_id
         )
    SELECT
        CASE
            WHEN COALESCE(a.alt_count, 0) >= 2 THEN TRUE
            ELSE FALSE
            END AS has_two_alts_raided,
        CASE
        WHEN COALESCE(a.alt_count, 0) >= 2 THEN 100.0
        ELSE COALESCE(a.alt_count, 0.0)*50.0 END AS progres
    FROM main_character mc
             LEFT JOIN alts a
                       ON mc.wow_account_id = a.account_id;
END;
$$;

