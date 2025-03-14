DROP FUNCTION add_extra_sr_on_time();
CREATE OR REPLACE FUNCTION add_extra_sr_on_time()
    RETURNS TRIGGER
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO public
AS $$
BEGIN
    WITH next_reset_in_2_days AS (
        SELECT rr.id AS reset_id, rr.raid_date
        FROM raid_resets rr
        WHERE rr.raid_date::date > (CURRENT_DATE + INTERVAL '2 days')::date
    )
    INSERT INTO ev_extra_reservations (character_id, reset_id, extra_reservations, source)
    SELECT rp.member_id, rp.raid_id, 1, 'on_time'
    FROM ev_raid_participant rp
             JOIN next_reset_in_2_days nr ON nr.reset_id = rp.raid_id
    WHERE rp.details->>'status' != 'declined'
      AND NOT EXISTS (
        SELECT 1
        FROM ev_extra_reservations eer
        WHERE eer.character_id = rp.member_id
          AND eer.reset_id = rp.raid_id
          AND eer.source = 'on_time'
    );
    RETURN NEW;
END;
$$;
