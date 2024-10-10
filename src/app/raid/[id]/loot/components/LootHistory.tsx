import {CharacterWithLoot} from "@/app/raid/[id]/loot/components/types";
import {LootItem} from "@/app/raid/[id]/loot/components/LootItem";
import {CharacterViewOptions} from "@/app/roster/[name]/components/CharacterViewOptions";

export function LootHistory({charactersWithLoot, charactersWithoutLoot}: {
    charactersWithLoot: CharacterWithLoot[];
    charactersWithoutLoot: CharacterWithLoot[];
}) {

    return (
        <CharacterViewOptions
            containerClassName={'flex h-[83%] flex-wrap'}
            innerContainerClassName={'flex h-full w-full scrollbar-pill overflow-auto'}
            items={[
                {
                    label: 'Loot gained',
                    name: 'loot',
                    children: <div
                        className="flex h-full gap-4 p-2 scrollbar-pill overflow-auto items-start justify-evenly flex-wrap">
                        {charactersWithLoot.map((loot, i) => {
                            return <LootItem key={i} loot={loot}/>
                        })}
                    </div>
                },
                {
                    label: 'No loot', name: 'no-loot', children: <div
                        className="flex h-full gap-4 p-2 scrollbar-pill overflow-auto items-start justify-evenly flex-wrap">
                        {charactersWithoutLoot.map((loot, i) => {
                            return <LootItem key={i} loot={loot}/>
                        })}
                    </div>
                },
            ]}
        />
    )
}
