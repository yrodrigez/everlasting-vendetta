import {cookies} from "next/headers";
import React from "react";
import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {CharacterWithLoot, RaidLoot} from "@/app/raid/[id]/loot/components/types";
import {LootItem} from "@/app/raid/[id]/loot/components/LootItem";
import Link from "next/link";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NotLoggedInView from "@/app/components/NotLoggedInView";

async function fetchLootHistory(supabase: any, raidId: string): Promise<RaidLoot[]> {
    const {error, data} = await supabase.from('ev_loot_history')
        .select('*')
        .eq('raid_id', raidId)

    if (error) {
        return []
    }
    const foundItemData: any[] = []
    return Promise.all(data.map(async (loot: any) => {
        let itemData = foundItemData.find((item) => item.itemID === loot.itemID)
        if (itemData) {
            return {
                ...loot,
                item: {
                    ...itemData
                }
            }
        }
        const fetchItem = await fetch(`https://nether.wowhead.com/tooltip/item/${loot.itemID}?dataEnv=4&locale=0`)
        const item = await fetchItem.json()
        item.icon = `https://wow.zamimg.com/images/wow/icons/medium/${item.icon}.jpg`
        foundItemData.push(item)
        return {
            ...loot,

            item: {
                ...item
            }
        }
    }))
}

export default async function ({params}: { params: { id: string } }) {

    const isLoggedInUser = cookies().get('evToken')
    if (!isLoggedInUser) {
        return <NotLoggedInView/>
    }


    const supabase = createServerComponentClient({cookies}, {
        options: {
            global: {
                headers: {
                    Authorization: `Bearer ${isLoggedInUser.value}`
                }
            }
        }
    })

    const lootHistory = await fetchLootHistory(supabase, params.id)
    if (!lootHistory?.length) {
        return <div>Could not find loot history</div>
    }

    const charactersWithLoot: CharacterWithLoot[] = (lootHistory ?? []).reduce((acc: CharacterWithLoot[], loot) => {
        const character = acc.find((c) => c.character === loot.character)
        if (!character) {
            acc.push({
                character: loot.character,
                loot: [loot]
            })
        } else {
            character.loot.push(loot)
        }
        return acc
    }, [])

    const sortedCharactersWithLoot = charactersWithLoot.sort((a, b) => {
        return a.character.localeCompare(b.character)
    }).filter((c) => c.character !== '_disenchanted')

    const disenchanted = charactersWithLoot.filter((c) => c.character === '_disenchanted')

    return (
        <div>
            <Link
                href={`/raid/${params.id}`} className={`mt-2 
                    px-2 py-3 text-white hover:text-gold 
                `}>
                <FontAwesomeIcon icon={faArrowLeft} className={'mr-2'}/>
                Back to raid
            </Link>
            {[...sortedCharactersWithLoot, ...disenchanted].map((loot, i) => {
                return <LootItem key={i} loot={loot}/>
            })}
        </div>
    )
}
