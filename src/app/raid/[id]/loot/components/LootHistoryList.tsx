'use client'
import {LootItem} from "@/app/raid/[id]/loot/components/LootItem";
import {CharacterWithLoot} from "@/app/raid/[id]/loot/components/types";

export default function LootHistoryList({lootHistory}: { lootHistory: CharacterWithLoot[] }) {

    return (
        <div className="flex h-full w-full relative justify-center">
            <div
                className="flex h-full gap-4 p-2 scrollbar-pill overflow-auto items-start justify-evenly flex-wrap relative">
                {lootHistory.map((loot, i) => {
                    return <LootItem key={i} loot={loot}/>
                })}

            </div>
        </div>
    )
}
