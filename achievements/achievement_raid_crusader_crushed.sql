drop function if exists achievement_raid_crusader_crushed;
create or replace function achievement_raid_crusader_crushed(character_name text)
    returns TABLE
            (
                achieved boolean,
                progress numeric
            )
    language plpgsql
    set search_path to 'public'
as
$$
BEGIN
    RETURN QUERY
        SELECT *
        from member_participated_reset(
                character_name,
                '34b0451e-4213-46bc-8c8b-85b07ac3967e'::uuid
             );
END;
$$;