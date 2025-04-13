import {cookies} from "next/headers";
import React from "react";
import {type SupabaseClient} from "@supabase/supabase-js";
import {CharacterWithLoot, RaidLoot} from "@/app/raid/[id]/loot/components/types";
import Link from "next/link";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import {Button} from "@/app/components/Button";
import createServerSession from "@utils/supabase/createServerSession";
import {GUILD_REALM_SLUG} from "@utils/constants";
import {LootHistory} from "@/app/raid/[id]/loot/components/LootHistory";
import {fetchItemDataFromWoWHead, groupByCharacter} from "@/app/raid/[id]/loot/util";
import {RaidParticipant} from "@/app/types/RaidParticipant";


async function fetchLootHistory(supabase: SupabaseClient, raidId: string): Promise<RaidLoot[]> {
    const {error, data} = await supabase
        .from('ev_loot_history')
        .select('*')
        .eq('raid_id', raidId)

    if (error) {
        return []
    }

    return Promise.all(data.map(fetchItemDataFromWoWHead))
}

async function fetchParticipants(supabase: SupabaseClient, raidId: string): Promise<CharacterWithLoot[]> {
    const {error, data} = await supabase
        .from('ev_raid_participant')
        .select('character:ev_member(*), details')
        .eq('raid_id', raidId)
        .neq('details->>status', 'declined')
        .returns<RaidParticipant[]>()

    if (error) {
        return []
    }

    return data.map((d: any) => {
        return {
            character: d.character.character.name,
            character_id: d.character.id,
            loot: [],
            plusses: 0,
            status: d.details?.status ?? 'unknown'
        }
    })
}

async function isItemPlus(supabase: SupabaseClient, itemID: number, resetId: string, characterId: number): Promise<boolean> {
    const {error, data} = await supabase
        .from('raid_loot_reservation')
        .select('*')
        .eq('item_id', itemID)
        .eq('reset_id', resetId)
        .eq('member_id', characterId)

    if (error) {
        console.error('Error checking if item is plus', error)
        return false
    }

    // item is a plus if it's not reserved
    return data?.length === 0
}

function fetchCharactersIds(supabase: SupabaseClient, characters: CharacterWithLoot[]): Promise<CharacterWithLoot[]> {
    return Promise.all(characters.map(async (c) => {
        const {error, data} = await supabase
            .from('ev_member')
            .select('id')
            .eq('character->>name', c.character)
            .eq('character->realm->>slug', GUILD_REALM_SLUG)

        if (error) {
            return c
        }

        return {
            ...c,
            character_id: data?.[0]?.id
        }
    }))
}

const fetchResetInfo = async (supabase: SupabaseClient, resetId: string) => {
    const {data, error} = await supabase
        .from('raid_resets')
        .select('raid_date, raid:ev_raid(*)')
        .eq('id', resetId)
        .single<{
            raid_date: string,
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
        raid_date: data.raid_date
    }
}


export default async function ({params}: { params: Promise<{ id: string }> }) {

    const {supabase, auth} = await createServerSession({cookies})
    const user = await auth.getSession()

    if (!user) {
        return <NotLoggedInView/>
    }
    const {id: resetId} = await params
    const lootHistory = await fetchLootHistory(supabase, resetId)
    if (!lootHistory?.length) {
        return <div>Could not find loot history</div>
    }

    const charactersWithLoot: CharacterWithLoot[] = groupByCharacter(lootHistory)

    const charactersWithIds = await fetchCharactersIds(supabase, charactersWithLoot)

    const characterPlusses = await Promise.all(charactersWithIds.map(async (c) => {
        const lootWithPlus = await Promise.all(c.loot.map(async (loot) => {
            if (!c.character_id) {
                return {
                    ...loot,
                    isPlus: false
                }
            }
            const isPlus = loot.offspec === 0 && await isItemPlus(supabase, loot.itemID, loot.raid_id, c.character_id)
            return {
                ...loot,
                isPlus
            }
        }))

        return {
            ...c,
            loot: lootWithPlus,
            plusses: lootWithPlus.filter((l) => l.isPlus).length
        }
    }))

    const sortedCharactersWithLoot = characterPlusses.sort((a, b) => {
        return a.character.localeCompare(b.character)
    }).filter((c) => c.character !== '_disenchanted')
        .sort((a, b) => {
            return b.loot.length - a.loot.length
        })


    const participants = await fetchParticipants(supabase, resetId)
    const charactersWithNoLoot = participants.filter((p) => !sortedCharactersWithLoot.find((c) => c.character === p.character))
    const disenchanted = charactersWithLoot.filter((c) => c.character === '_disenchanted')
    const resetInfo = await fetchResetInfo(supabase, resetId)
    if (!resetInfo) {
        return <div>Could not find reset info</div>
    }

    return (
        <div className="flex flex-col w-full h-full scrollbar-pill">
            <div className="flex gap-4 items-center justify-between w-full text-gold rounded-lg bg-dark p-2">
                <Button
                    as="a"
                    href={`/raid/${resetId}`}
                    variant="light"
                    isIconOnly
                >
                    <FontAwesomeIcon icon={faArrowLeft}/>
                </Button>
                <h1 className="text-2xl font-bold">Loot History</h1>
                <div
                    className="flex flex-col gap-4 items-center">
                    {resetInfo && <><span>{resetInfo.name} </span><span> {resetInfo.raid_date}</span></>}
                </div>
            </div>
            <LootHistory charactersWithLoot={[...sortedCharactersWithLoot, ...disenchanted]}
                         charactersWithoutLoot={charactersWithNoLoot}/>
        </div>
    )
}
