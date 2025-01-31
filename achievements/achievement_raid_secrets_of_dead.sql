CREATE OR REPLACE FUNCTION achievement_raid_secrets_of_dead(character_name text)
    RETURNS TABLE (
                      achieved boolean,
                      progress numeric
                  )
    LANGUAGE plpgsql
    SET search_path TO 'public'
AS
$$
DECLARE
    manually_achieved_players text[] := ARRAY[
        'Alveric',
        'Templaari',
        'Mephius',
        'Neffertiri',
        'Salgo',
        'Sloozy',
        'Finasusu'
        ];
BEGIN
    IF character_name = ANY(manually_achieved_players) THEN
        achieved := true;
        progress := 100.0;
    ELSE
        achieved := false;
        progress := 0.0;
    END IF;

    RETURN NEXT;
END;
$$;
