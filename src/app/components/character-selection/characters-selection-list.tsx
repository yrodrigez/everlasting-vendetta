'use client';

import { useUserCharacters } from "@/app/hooks/use-user-charcters";
import { ScrollShadow } from "@heroui/react";
import { useCharacterStore } from "../characterStore";
import { useCallback, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useAllowedRealms } from "@/app/hooks/api/use-allowed-realms";
import { useMessageBox } from "@/app/util/msgBox";
import { useVistaStore } from "./vista-store";
import { Role } from "./role-selection";

const CharacterView = ({ character }: { character: any }) => {
    const { setSelectedCharacter, selectedCharacter } = useCharacterStore(state => state);
    const onSelect = useCallback(() => {
        if (selectedCharacter?.id === character.id) {
            return;
        }
        setSelectedCharacter(character);
    }, [character, selectedCharacter, setSelectedCharacter]);

    return (
        <article
            className={`flex items-center gap-4 rounded-2xl border transition-all duration-300 ${selectedCharacter?.id === character.id ? 'border-green-600 shadow-md shadow-green-600' : 'border-wood-100'} bg-wood-900 p-4 shadow-md cursor-pointer hover:bg-wood-900/70 hover:shadow-wood-100`}
            onClick={onSelect}
        >
            <div
                className={`min-w-12 min-h-12 rounded-full border-2 border-${character.character_class?.name.toLowerCase()} bg-cover bg-center bg-no-repeat`}
                style={{ backgroundImage: `url(${character.avatar})` }}
            />
            <div className="flex flex-col grow">
                <span className={`text-lg capitalize font-semibold text-${character.character_class?.name.toLowerCase()}`}>{character.name}</span>
                <span className="text-sm text-wood-50">
                    Level {character.level} {character.className}
                </span>
                <span className="text-xs tracking-wide text-wood-200 capitalize">
                    {character.realm.name}
                </span>
            </div>
            {selectedCharacter?.id === character.id && (
                selectedCharacter?.selectedRole ?
                    (<Role size="lg" role={selectedCharacter.selectedRole} />)
                    : (<span className="text-sm font-bold text-green-500"><FontAwesomeIcon icon={faCheckCircle} /></span>)
            )}
        </article>
    );
}
export function CharactersSelectionList() {
    const { characters = [], isLoading } = useUserCharacters();
    const { allowedRealms } = useAllowedRealms();
    const { setCharacters } = useCharacterStore(state => state);

    const { selectedCharacter } = useCharacterStore(state => state);

    const { alert } = useMessageBox();

    useEffect(() => {
        if (characters.length > 0) {
            setCharacters(characters);
        }
    }, [characters, setCharacters]);



    const setVista = useVistaStore(state => state.setVista);
    const currentVista = useVistaStore(state => state.vista);
    useEffect(() => {
        if (characters.length === 0 && !isLoading && currentVista === 'list') {
            alert({
                title: 'No Characters Found',
                message: 'No characters were found in your account. Please link a character to continue.',
                type: 'error',
            });
            setVista('link');
        }
    }, [characters, isLoading, setVista, alert]);

    if (isLoading) {
        return (
            <ScrollShadow className="flex flex-col gap-3 w-full max-h-96 overflow-auto scrollbar-pill px-1 h-full">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="animate-pulse flex items-center gap-4 rounded-2xl border border-wood-700 bg-wood-900 p-4 shadow-md">
                        <div className="min-w-12 min-h-12 rounded-full bg-wood-700" />
                        <div className="flex flex-col grow gap-2">
                            <div className="h-5 bg-wood-700 rounded w-1/3"></div>
                            <div className="h-4 bg-wood-700 rounded w-1/4"></div>
                            <div className="h-3 bg-wood-700 rounded w-1/5"></div>
                        </div>
                    </div>
                ))}
            </ScrollShadow>
        );
    }

    return (
        <ScrollShadow className="flex flex-col gap-3 w-full h-72 overflow-auto scrollbar-pill px-1">
            {characters?.sort((a: any, b: any) => {
                if (selectedCharacter?.id === a.id) return -1;
                if (selectedCharacter?.id === b.id) return 1;
                return 0;
            }).filter((character: any) => allowedRealms.map((realm: { name: string }) => realm.name).includes(character.realm.name)).map((character: any) => (
                <CharacterView key={character.id} character={character} />
            ))}
        </ScrollShadow>
    );
}
