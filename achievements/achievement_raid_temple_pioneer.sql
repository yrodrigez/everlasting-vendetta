create or replace function achievement_raid_temple_pioneer(character_name text)
    returns TABLE(achieved boolean, progress numeric)
    language plpgsql
as
$$
BEGIN
RETURN QUERY
select
    case when count(*) >= 1 then true
        else false
        end as achieved,
    case when count(*) >= 1 then 100.0
        else 0.0
        end as progress
    from ev_raid_participant rp
  join ev_member on ev_member.id = rp.member_id
 where raid_id = 'f1c72c81-c0d2-4adc-aa3f-ed26fc68ca5b'
   and is_confirmed = true
 and ev_member.character->>'name' = character_name;
END;
$$;
