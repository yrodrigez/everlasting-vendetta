create or replace function achievement_reserve_unicorn_hunter(character_name text)
    returns TABLE(achieved boolean, progress numeric)
    language plpgsql
as
$$
BEGIN
RETURN QUERY
    WITH items_reserverd_not_dropped AS (
        SELECT rls.member_id, rls.item_id, rls.reset_id
        FROM raid_loot_reservation rls
        JOIN raid_resets rr ON rr.id = rls.reset_id
        WHERE rls.item_id NOT IN (
            SELECT "itemID"
            FROM ev_loot_history
            WHERE raid_id = rls.reset_id
            AND character != '_disenchanted'
        )
        AND (rr.end_date::TEXT || ' ' || rr.end_time::TEXT)::TIMESTAMP <= CURRENT_DATE - INTERVAL '1.5 day'
        GROUP BY rls.member_id, rls.item_id, rls.reset_id

    ), most_reserved_item AS (
        SELECT count(DISTINCT reset_id) AS count, item_id FROM items_reserverd_not_dropped
        JOIN ev_member m ON m.id = member_id
        WHERE m.character->>'name' = character_name
        GROUP BY item_id
        ORDER BY count DESC
        LIMIT 1
    ) SELECT
          CASE
              WHEN COALESCE(count, 0) >= 10 THEN TRUE
              ELSE FALSE
              END AS has_two_alts_raided,
          CASE
              WHEN COALESCE(count, 0) >= 10 THEN 100.0
              ELSE COALESCE(count, 0.0)*10.0 END AS progres
    FROM most_reserved_item;
END;
$$;
