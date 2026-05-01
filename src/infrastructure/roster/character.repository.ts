import { SupabaseClient } from "@supabase/supabase-js";

export class CharacterRepository {
    constructor(private readonly supabase: SupabaseClient) { }

    async findAlters(name: string, realm: string) {
        const { data: userIdResult, error: userIdError } = await this.supabase.from('ev_member')
            .select('user_id')
            .ilike('character->>name', name.toLowerCase())
            .eq('character->realm->>slug', realm)
            

        if (userIdError) {
            console.error(`[CharacterRepository] Error fetching user ID for character ${name} - ${realm}: ` + JSON.stringify(userIdError))
            return []
        }

        if (!userIdResult || userIdResult.length === 0 || !userIdResult[0].user_id) {
            console.warn(`[CharacterRepository] No user ID found for character ${name} - ${realm}`)
            return []
        }


        const { data: altersResult, error: altersError } = await this.supabase.from('ev_member')
            .select('id, character')
            .eq('user_id', userIdResult[0].user_id)

        if (altersError) {
            console.error(`[CharacterRepository] Error fetching alters for user ID ${userIdResult[0].user_id}: ` + JSON.stringify(altersError))
            return []
        }

        return (altersResult || []).map(alter => ({ id: alter.id, ...alter.character })).filter((character): character is { id: number, name: string, realm: { slug: string }, level: number, playable_class?: { name: string }, avatar: string } =>
            typeof character.name === 'string' &&
            character.realm &&
            typeof character.realm.slug === 'string' &&
            typeof character.level === 'number' &&
            (!character.playable_class || typeof character.playable_class.name === 'string')
            && character.level > 10
        ).map(character => ({
            id: character.id,
            name: character.name,
            realm: character.realm,
            level: character.level,
            characterClass: character.playable_class?.name || 'Unknown',
            avatar: character.avatar
        }))
    }
}