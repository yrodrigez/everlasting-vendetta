CREATE OR REPLACE FUNCTION public.get_recent_raid_reliability_rating(
    p_character_name text,
    p_realm_slug text
)
RETURNS TABLE (
    coverage_score numeric,
    weekly_presence_score numeric,
    weighted_weekly_score numeric,
    final_recent_reliability numeric,
    weeks_considered integer,
    opportunities_considered integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
WITH current_period AS (
    SELECT
        (
            date_trunc('week', current_date::timestamp - interval '2 days')
            + interval '2 days'
        )::date AS current_save_week_start
),
the_character AS (
    SELECT m.*
    FROM public.ev_member m
    WHERE lower(m."character"->>'name') = lower(p_character_name)
      AND lower(m."character"->'realm'->>'slug') = lower(p_realm_slug)
    ORDER BY m.created_at DESC
    LIMIT 1
),
relevant_members AS (
    SELECT m.id
    FROM the_character tc
    JOIN public.ev_member m
      ON m.user_id = tc.user_id
),
valid_resets AS (
    SELECT
        rs.id AS reset_id,
        rs.raid_id,
        rs.name AS raid_name,
        (
            date_trunc('week', rs.raid_date::timestamp - interval '2 days')
            + interval '2 days'
        )::date AS save_week_start
    FROM public.raid_resets rs
    JOIN public.ev_raid r
      ON r.id = rs.raid_id
    WHERE (
        SELECT COUNT(*)
        FROM public.ev_raid_participant rp
        WHERE rp.raid_id = rs.id
          AND (
              CASE
                  WHEN rp.details->>'status' IS NOT NULL
                      THEN (rp.details->>'status') IN ('confirmed', 'tentative', 'bench', 'late')
                  ELSE rp.is_confirmed
              END
          )
    ) >= r.size * 0.5
      AND COALESCE(rs.status, '') <> 'cancelled'
      AND (
            rs.end_date::timestamp
            + COALESCE(rs.time, time '00:00')
          ) < now() - interval '12 hours'
),
recent_weeks AS (
    SELECT x.save_week_start
    FROM (
        SELECT DISTINCT vr.save_week_start
        FROM valid_resets vr
        CROSS JOIN current_period cp
        WHERE vr.save_week_start < cp.current_save_week_start
        ORDER BY vr.save_week_start DESC
        LIMIT 10
    ) x
),
recent_valid_resets AS (
    SELECT vr.*
    FROM valid_resets vr
    JOIN recent_weeks rw
      ON rw.save_week_start = vr.save_week_start
),
weekly_raid_status AS (
    SELECT
        rvr.save_week_start,
        rvr.raid_id,
        COALESCE(
            MAX(
                CASE
                    WHEN rm.id IS NOT NULL THEN
                        CASE
                            WHEN rp.details->>'status' IS NOT NULL THEN
                                CASE rp.details->>'status'
                                    WHEN 'confirmed' THEN 1.0
                                    WHEN 'bench' THEN 1.0
                                    WHEN 'late' THEN 0.8
                                    WHEN 'tentative' THEN 0.4
                                    WHEN 'declined' THEN 0.1
                                    ELSE 0.0
                                END
                            ELSE
                                CASE
                                    WHEN rp.is_confirmed THEN 1.0
                                    ELSE 0.0
                                END
                        END
                    ELSE NULL
                END
            ),
            0.0
        ) AS participation_score
    FROM recent_valid_resets rvr
    LEFT JOIN public.ev_raid_participant rp
        ON rp.raid_id = rvr.reset_id
    LEFT JOIN relevant_members rm
        ON rm.id = rp.member_id
    GROUP BY
        rvr.save_week_start,
        rvr.raid_id
),
weekly_scores AS (
    SELECT
        wrs.save_week_start,
        COUNT(*)::integer AS available_raid_types,
        ROUND(SUM(wrs.participation_score), 4) AS attended_raid_types_weighted,
        SUM(wrs.participation_score) / NULLIF(COUNT(*), 0) AS week_ratio
    FROM weekly_raid_status wrs
    GROUP BY wrs.save_week_start
),
ranked_weeks AS (
    SELECT
        x.*,
        (x.total_weeks - x.recency_rank + 1) AS recency_weight
    FROM (
        SELECT
            ws.*,
            row_number() OVER (ORDER BY ws.save_week_start DESC) AS recency_rank,
            count(*) OVER () AS total_weeks
        FROM weekly_scores ws
    ) x
),
coverage_agg AS (
    SELECT
        COALESCE(
            ROUND(
                100.0 * SUM(participation_score) / NULLIF(COUNT(*), 0),
                2
            ),
            0
        ) AS coverage_score,
        COUNT(*)::integer AS opportunities_considered
    FROM weekly_raid_status
),
weekly_agg AS (
    SELECT
        COALESCE(
            ROUND(
                100.0 * COUNT(*) FILTER (WHERE attended_raid_types_weighted > 0) / NULLIF(COUNT(*), 0),
                2
            ),
            0
        ) AS weekly_presence_score,
        COALESCE(
            ROUND(
                100.0 * SUM(week_ratio * recency_weight) / NULLIF(SUM(recency_weight), 0),
                2
            ),
            0
        ) AS weighted_weekly_score,
        COUNT(*)::integer AS weeks_considered
    FROM ranked_weeks
)
SELECT
    ca.coverage_score,
    wa.weekly_presence_score,
    wa.weighted_weekly_score,
    ROUND(
        ca.coverage_score * 0.35
        + wa.weighted_weekly_score * 0.65,
        2
    ) AS final_recent_reliability,
    wa.weeks_considered,
    ca.opportunities_considered
FROM coverage_agg ca
CROSS JOIN weekly_agg wa;
$function$;