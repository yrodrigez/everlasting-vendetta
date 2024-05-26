import {type SupabaseClient} from "@supabase/auth-helpers-nextjs";

/**
 * Insert a character if it does not exist in the database
 *
 * @param supabase {SupabaseClient} Supabase client
 * @param character  The character to insert
 * @param registrationSource {string} The source of the registration
 * @returns {Promise<string>} The id of the character
 * @throws {Error} If an error occurs
 */
export async function insertCharacterIfNotExists(supabase: SupabaseClient, character: any, registrationSource: string = 'bnet_oauth'): Promise<number> {
    const {data: existingData, error: checkError} = await supabase
        .from('ev_member')
        .select('id')
        .eq('id', character.id)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(`Error checking existing data: ${checkError?.message}`);
    } else if (!existingData) {
        const {data, error} = await supabase
            .from('ev_member')
            .insert({
                id: character.id,
                character: character,
                updated_at: new Date(),
                registration_source: 'manual_reservation'
            })
            .select('id, user_id')
            .single();

        if (error) {
            throw new Error(`Error inserting data: ${error.message}`);
        }

        return data.id;
    }

    return existingData?.id ?? character.id;
}
