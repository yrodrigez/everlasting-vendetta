'use client';
import {useMutation} from "@tanstack/react-query";
import {useEffect} from "react";
import {
    convertLootCsvToObjects,
    fetchItemDataFromWoWHead,
    groupByCharacter,
    parseLootCsv
} from "@/app/raid/[id]/loot/util";
import {type CharacterWithLoot, RaidLoot} from "@/app/raid/[id]/loot/components/types";
import LootHistoryList from "@/app/raid/[id]/loot/components/LootHistoryList";

export default function LootHistoPreview({reset_id}: { reset_id: string }) {

    const {mutate, error, data, isPending} = useMutation({
        mutationKey: ['loot_history.create'],
        mutationFn: async (data: string) => {
            if (!data) {
                return []
            }
            try {
                const csv = parseLootCsv(data as string)
                const lootObjects = convertLootCsvToObjects(csv).map((loot): RaidLoot => ({
                    ...loot,
                    raid_id: reset_id,
                    item: {
                        icon: '',
                        // @ts-ignore
                        id: loot.itemID.toString(),
                        name: '',
                        quality: 0,
                        tooltip: '',
                        spells: [],
                    }
                }))

                return groupByCharacter(await Promise.all(lootObjects.map(fetchItemDataFromWoWHead)))
            } catch (error) {
                console.error('Error parsing loot csv', error)
                return []
            }
        },

    })

    return (
        <div
            className="flex gap-4 h-full w-full"
        >
            <textarea
                onBlur={(e) => {
                    mutate(e.target.value)
                }}
                className="bg-wood text-default w-full p-2 rounded h-full"
                name="loot" id="loot" cols={30} rows={10}></textarea>
            <div className="flex relative w-full h-full">
                {data?.length ? <div
                    className="w-full h-full overflow-y-auto"
                ><LootHistoryList
                    lootHistory={data as CharacterWithLoot[]}
                /> </div>: null}
                {isPending && <div
                  className="absolute bg-[rgba(255,255,255,.3)] top-0 left-0 bottom-0 right-0 w-full h-full flex justify-center items-center">
                  Loading...
                </div>}
            </div>

        </div>
    )
}
