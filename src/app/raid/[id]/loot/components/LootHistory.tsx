import {CharacterWithLoot} from "@/app/raid/[id]/loot/components/types";
import {LootItem} from "@/app/raid/[id]/loot/components/LootItem";
import {CharacterViewOptions} from "@/app/roster/[name]/components/CharacterViewOptions";
import LootHistoryList from "@/app/raid/[id]/loot/components/LootHistoryList";

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
                    children:
                        <LootHistoryList lootHistory={charactersWithLoot}/>
                },
                {
                    label: 'No loot', name: 'no-loot', children:
                        <LootHistoryList lootHistory={charactersWithoutLoot}/>
                },
            ]}
        />
    )
}
