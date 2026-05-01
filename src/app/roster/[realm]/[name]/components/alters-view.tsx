import { CharacterCard } from "@/app/profiles/me/components/characters";
import { ScrollShadow } from "@/components/scroll-shadow";

export function AltersView({ name, realm, alters }: { name: string, realm: string, alters: { id: number, name: string, realm: { slug: string }, characterClass: string, level: number, avatar: string }[] }) {

    const characters = alters.filter(alter => alter.level > 20 && `${alter.name.toLocaleLowerCase()}-${alter.realm.slug}` !== `${name.toLocaleLowerCase()}-${realm}`).sort((a, b) => b.level - a.level)
    return characters.length === 0 ? (
        <div className="text-center text-gray-500 w-full h-full flex items-center justify-center rounded-lg border border-gray-900 bg-gray-500/10 p-4 ">
            No characters found.
        </div>
    ) : (
        <div
            className="rounded-lg border border-wood-100 bg-wood h-full w-full">
            <ScrollShadow
                className="w-full h-full"
            >
                <div className="flex gap-4 flex-wrap p-4 justify-center">
                    {characters.map((alter, index) => (
                        <CharacterCard
                            key={index}
                            isSelected={false}
                            character={{
                                id: alter.id + '',
                                name: alter.name,
                                realm: alter.realm,
                                level: alter.level,
                                className: alter.characterClass,
                                avatar: alter.avatar
                            }}
                        ></CharacterCard>
                    ))}
                </div>
            </ScrollShadow>
        </div>
    )
}