import {type SupabaseClient} from "@supabase/supabase-js";
import {Profession, ProfessionName, ProfessionSpell} from "@/app/roster/[name]/components/CharacterProfessions";

export async function fetchProfessionSpells(supabase: SupabaseClient, professionId: number, pagination: {
    page: number,
    pageSize: number
} = {page: 1, pageSize: 50}, filter: undefined | {
    name?: string,
    ids?: number[]
}) {
    const {page, pageSize} = pagination
    const {data: professionSpells, error: spellError} = await supabase.from('profession_spells')
        .select('id, name, details, craftedItem:wow_items(id, details), profession:professions!inner(id, name)')
        .range((page - 1) * pageSize, page * pageSize - 1)
        .eq('profession_id', professionId)
        .filter(filter?.name ? 'name' : '', 'ilike', `%${filter?.name}%`)
        .filter(filter?.ids ? 'id' : '', 'in', `(${filter?.ids?.join(',')})`)
        .returns<{
            id: number,
            details: any,
            name: string,
            craftedItem: { id: number, details: any },
            profession: { id: number, name: ProfessionName }
        }[]>()

    if (spellError) {
        console.error('Error fetching profession spells:', spellError)
        return;
    }

    return professionSpells.reduce((acc, _spell) => {
        const spell = {
            profession: {
                id: _spell.profession.id,
                name: _spell.profession.name,
            },
            id: _spell.id,
            icon: _spell.details?.icon,
            quality: _spell.details?.quality,
            name: _spell.name,
            materials: _spell.details?.materials?.map((x: {
                name: string,
                quantity: number,
                itemid: number
            }) => ({name: x.name, quantity: x.quantity, itemId: x.itemid})) || [],
            craftedItem: _spell.craftedItem?.details ? {
                ..._spell.craftedItem?.details,
            } : undefined,
        } as ProfessionSpell
        if (!acc) {
            acc = {
                id: spell.profession.id,
                name: spell.profession.name,
                spells: [spell],
                icon: `/profession-icons/${spell.profession.name.toLowerCase()}.webp`
            }
        } else {
            acc.spells.push(spell)
        }
        return acc
    }, undefined as unknown as Profession)
}

export async function fetchCharacterProfessionsSpells(supabase: SupabaseClient, characterId: number, filter?: {
    spellName?: string,
}) {
    const {data: learned, error} = await supabase.from('member_profession_spells')
        .select('spell:profession_spells!inner(id),profession:professions!inner(id)')
        .eq('member_id', characterId)
        .returns<{
            spell: { id: number },
            profession: { id: number }
        }[]>()

    if (error) {
        console.error('Error fetching professions:', error)
        return []
    }

    if (!learned || learned.length === 0) {
        return []
    }


    const professionSpells = (await Promise.all(learned.reduce((acc, curr) => {
        const found = acc.find(({profession}) => profession.id === curr.profession.id)
        if (!found) {
            acc.push({profession: curr.profession, spells: [curr.spell.id]})
        } else {
            found.spells.push(curr.spell.id)
        }
        return acc
    }, [] as { profession: { id: number }, spells: number[] }[]).map(({
                                                                          profession,
                                                                          spells
                                                                      }) => fetchProfessionSpells(supabase, profession.id, undefined, {ids: spells, name: filter?.spellName})))) as Profession[]

    return professionSpells.map((p) => {
        const learnedSpells = learned.filter(({profession}) => profession.id === p?.id).map(({spell}) => spell.id)
        return {
            ...p,
            spells: p?.spells.filter((s) => learnedSpells.includes(s.id))
        }
    })
}