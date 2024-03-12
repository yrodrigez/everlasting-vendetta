import CharacterAvatar from "@/app/components/CharacterAvatar";

export default function AvailableCharactersList({characters, onCharacterSelect}: {
    characters: any[],
    onCharacterSelect?: (character: any) => void
}) {

    return characters.map((character: any) => {
        return (
            <div
                onClick={() => onCharacterSelect && onCharacterSelect(character)}
                key={character.id}
                className={`flex gap-4 items-center justify-between ${onCharacterSelect && 'hover:bg-gold hover:bg-opacity-20 py-2 px-4 rounded cursor-pointer'}`}>
                <div className={'flex gap-4 items-center'}>
                    <CharacterAvatar
                        className={'rounded-full  w-14 border-2 border-gold'}
                        characterName={character.name}
                        realm={character.realm.slug}
                        />
                    <div className={'flex flex-col gap-1'}>
                        <h2 className={'text-gold font-bold text-xl'}>{character.name}</h2>
                        <p className={'text-white'}>Level {character.level} {character.playable_class.name}</p>
                    </div>
                </div>
            </div>
        )
    })
}
