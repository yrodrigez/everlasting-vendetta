'use client'
import {LootItem} from "@/app/raid/[id]/loot/components/LootItem";
import {CharacterWithLoot} from "@/app/raid/[id]/loot/components/types";
import {ScrollShadow} from "@heroui/scroll-shadow";

export default function LootHistoryList({lootHistory}: { lootHistory: CharacterWithLoot[] }) {

    return (
        <div className="flex h-full w-full relative justify-center py-2">
            <ScrollShadow
                className="flex h-full gap-4 p-2 scrollbar-pill overflow-auto items-start justify-evenly flex-wrap relative">
                {lootHistory.map((loot, i) => {
                    return <LootItem key={i} loot={loot}/>
                })}
            </ScrollShadow>
        </div>
    )
}
