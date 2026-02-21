import { Button } from "@/app/components/Button";
import { createAPIService } from "@/app/lib/api";
import { LootHistory } from "@/app/raid/[id]/loot/components/LootHistory";
import { CharacterWithLoot, RaidLoot } from "@/app/raid/[id]/loot/components/types";
import { fetchItemDataFromWoWHead, groupByCharacter } from "@/app/raid/[id]/loot/util";
import { RaidParticipant } from "@/app/types/RaidParticipant";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type SupabaseClient } from "@supabase/supabase-js";
import createServerSession from "@utils/supabase/createServerSession";
import { notFound } from "next/navigation";

async function fetchLootHistory(supabase: SupabaseClient, raidId: string): Promise<RaidLoot[]> {
    const { error, data } = await supabase
        .from('ev_loot_history')
        .select('*')
        .eq('raid_id', raidId)

    if (error) {
        return []
    }
    
    const apiService = createAPIService();

    const items = await Promise.all(data.map(async (item) => {
        const itemData = await apiService.anon.getItem(item.itemID)
        return {
            ...itemData,
            id: item.itemID
        }
    }));

    return data.map((loot) => {
        const itemData = items.find((i) => i.id === loot.itemID)?.itemDetails
        return {
            ...loot,
            item: itemData
        }
    })
}

async function fetchParticipants(supabase: SupabaseClient, raidId: string, realmSlug: string): Promise<CharacterWithLoot[]> {
    const { error, data } = await supabase
        .from('ev_raid_participant')
        .select('character:ev_member(*), details')
        .eq('raid_id', raidId)
        .neq('details->>status', 'declined')
        .overrideTypes<RaidParticipant[]>()

    if (error) {
        return []
    }

    return data.map((d: any) => {
        return {
            character: d.character.character.name,
            character_id: d.character.id,
            loot: [],
            plusses: 0,
            status: d.details?.status ?? 'unknown',
            realm: d.character.character.realm.slug || realmSlug
        }
    })
}


const getResetReservations = async (supabase: SupabaseClient, resetId: string): Promise<{ item_id: number, character_id: number }[]> => {
    const { error, data } = await supabase
        .from('raid_loot_reservation')
        .select('*')
        .eq('reset_id', resetId)

    if (error) {
        console.error('Error fetching reset reservations', error)
        return []
    }

    return data.map((d) => ({
        item_id: d.item_id,
        character_id: d.member_id
    }))
}

async function fetchCharactersIds(supabase: SupabaseClient, characters: CharacterWithLoot[], realmSlug: string): Promise<CharacterWithLoot[]> {
    const names = characters.map((c) => c.character)
    const realm = realmSlug.toLowerCase()

    const { error, data } = await supabase.from('ev_member')
        .select('id, character')
        .in('character->>name', names)
        .eq('character->realm->>slug', realm)

    if (error) {
        console.error('Error fetching character ids', error)
        return characters
    }

    const charactersWithIds = characters.map((c) => {
        const characterData = data?.find((d) => d.character.name === c.character)
        return {
            ...c,
            realm: realm,
            character_id: characterData?.id
        }
    })

    return charactersWithIds
}

const fetchResetInfo = async (supabase: SupabaseClient, resetId: string) => {
    const { data, error } = await supabase
        .from('raid_resets')
        .select('raid_date, realm, raid:ev_raid(*)')
        .eq('id', resetId)
        .single<{
            raid_date: string,
            realm: string,
            raid: {
                name: string
            }
        }>()

    if (error) {
        console.error('Error fetching reset info', error)
        return null
    }

    return {
        name: data.raid.name,
        raid_date: data.raid_date,
        realmSlug: data.realm
    }
}


export default async function ({ params }: { params: Promise<{ id: string }> }) {

    const { getSupabase } = await createServerSession();

    const { id: resetId } = await params
    const supabase = await getSupabase();
    const lootHistory = await fetchLootHistory(supabase, resetId)
    if (!lootHistory?.length) {
        console.warn('No loot history found for raid', resetId)
        return notFound()
    }


    const resetInfo = await fetchResetInfo(supabase, resetId)
    if (!resetInfo) {
        console.warn('No reset info found for raid', resetId)
        return notFound()
    }

    const charactersWithLoot: CharacterWithLoot[] = groupByCharacter(lootHistory, resetInfo.realmSlug)
    const charactersWithIds = await fetchCharactersIds(supabase, charactersWithLoot, resetInfo.realmSlug)
    const reservations = await getResetReservations(supabase, resetId)

    const characterPlusses = charactersWithIds.map((c) => {
        const lootWithPlus = c.loot.map((loot) => {
            if (!c.character_id) {
                return {
                    ...loot,
                    isPlus: false
                }
            }
            const isPlus = loot.offspec === 0 && !reservations.find((l) => l.item_id === loot.itemID && l.character_id === c.character_id)
            return {
                ...loot,
                isPlus
            }
        })

        return {
            ...c,
            loot: lootWithPlus,
            plusses: lootWithPlus.filter((l) => l.isPlus).length
        }
    })

    const sortedCharactersWithLoot = characterPlusses.sort((a, b) => {
        return a.character.localeCompare(b.character)
    }).filter((c) => c.character !== '_disenchanted')
        .sort((a, b) => {
            return b.loot.length - a.loot.length
        })


    const participants = await fetchParticipants(supabase, resetId, resetInfo?.realmSlug || '')
    const charactersWithNoLoot = participants.filter((p) => !sortedCharactersWithLoot.find((c) => c.character === p.character))
    const disenchanted = charactersWithLoot.filter((c) => c.character === '_disenchanted')


    return (
        <div className="flex flex-col w-full h-full scrollbar-pill">
            <div className="flex gap-4 items-center justify-between w-full text-gold rounded-lg bg-dark p-2">
                <Button
                    as="a"
                    href={`/raid/${resetId}`}
                    variant="light"
                    className="text-gold"
                    isIconOnly
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h1 className="text-2xl font-bold">Loot History</h1>
                <div
                    className="flex flex-col gap-2 items-center">
                    {resetInfo && <><span>{resetInfo.name} </span>
                        <span className="text-sm text-gray-500 capitalize">{resetInfo.realmSlug}</span>
                        <span> {resetInfo.raid_date}</span>

                    </>}
                </div>
            </div>
            <LootHistory charactersWithLoot={[...sortedCharactersWithLoot, ...disenchanted]}
                charactersWithoutLoot={charactersWithNoLoot} />
        </div>
    )
}
