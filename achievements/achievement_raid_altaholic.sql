create or replace function achievement_raid_altaholic(character_name text)
    returns TABLE(achieved boolean, progress numeric)
    language plpgsql
    set search_path to 'public'
as
$$
BEGIN
RETURN QUERY
    WITH user_id AS (
        SELECT user_id
        FROM ev_member
        WHERE character ->> 'name' = character_name
          AND character -> 'guild' ->> 'name' = 'Everlasting Vendetta'
          AND user_id is not null
        LIMIT 1
    ),
         alts AS (
             SELECT
                 m.user_id AS user_id,
                 COUNT(DISTINCT m.character ->> 'name') AS alt_count
             FROM ev_member m
             WHERE m.user_id = (SELECT user_id FROM user_id LIMIT 1)
               AND m.character -> 'guild' ->> 'name' = 'Everlasting Vendetta'
               AND m.character ->> 'name' <> character_name
               AND EXISTS (
                   SELECT 1 FROM raid_loot_reservation rlr
                   WHERE rlr.member_id = m.id
               )
               AND EXISTS (
                   SELECT 1 FROM ev_loot_history lh
                   WHERE lh.character = m.character ->> 'name'
               )
             GROUP BY m.user_id
         )
    SELECT
        CASE
            WHEN COALESCE(a.alt_count, 0) >= 2 THEN TRUE
            ELSE FALSE
            END AS has_two_alts_raided,
        CASE
        WHEN COALESCE(a.alt_count, 0) >= 2 THEN 100.0
        ELSE COALESCE(a.alt_count, 0.0)*50.0 END AS progress
    FROM user_id mc
             LEFT JOIN alts a
                       ON mc.user_id = a.user_id;
END;
$$;

