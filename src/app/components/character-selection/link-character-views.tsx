import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Skeleton } from "@heroui/react";
import { useMemo } from "react";

export function LinkCharacterView({ character, isLoaded, isError, isLoading }: { character: any, isLoaded: boolean, isError: boolean, isLoading: boolean }) {
    const shouldClassName = useMemo(() => {
        return isLoading || !isLoaded || !character;
    }, [character, isLoading, isLoaded]);

    return (
        <LinkCharacterContainer characterClassName={character?.playable_class?.name} isError={isError}>
            <Skeleton disableAnimation={!isLoading} className={`rounded-full w-16 h-16 ${isError ? 'bg-red-600' : 'bg-wood-100'} border ${isError ? 'border-red-800' : 'border-wood'}`} isLoaded={isLoaded && !isError}>
                <img src={character?.avatar} alt={`${character?.name} avatar`} className={`w-16 h-16 rounded-full border ${character?.faction === 'ALLIANCE' ? 'border-blue-500' : 'border-red-500'}`} />
            </Skeleton>
            <div className="flex flex-col gap-1 grow ml-4">
                <Skeleton disableAnimation={!isLoading} className={!shouldClassName ? undefined : `rounded-lg w-full min-h-5 ${isError ? 'bg-red-600' : 'bg-wood-100'} border ${isError ? 'border-red-800' : 'border-wood'}`} isLoaded={isLoaded && !isError}>
                    <h2 className={`text-lg font-bold w-full text-${character?.character_class?.name.toLowerCase()}`}>{character?.name}</h2>
                </Skeleton>
                <Skeleton disableAnimation={!isLoading} className={!shouldClassName ? undefined : `rounded-lg w-full min-h-5 ${isError ? 'bg-red-600' : 'bg-wood-100'} border ${isError ? 'border-red-800' : 'border-wood'}`} isLoaded={isLoaded && !isError}>
                    <p className="text-sm text-gray-300 w-full">
                        Level {character?.level} {character?.playable_class?.name}
                    </p>
                </Skeleton>
            </div>
        </LinkCharacterContainer>
    );
}

function LinkCharacterContainer({ characterClassName, children, isError }: { characterClassName: string, children: React.ReactNode, isError: boolean }) {
    return (
        <div className={`relative p-4 h-24 border ${isError ? 'border-red-800' : characterClassName?.toLowerCase() ? `border-${characterClassName.toLowerCase()}` : 'border-wood-100'} rounded ${isError ? 'bg-red-900' : 'bg-wood-900'} w-full flex justify-between items-center`}>
            {children}
            {isError && (
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/10 text-red-500" title="Error fetching character">
                    <div className="flex items-center bg-black/70 px-3 py-2 rounded ">
                        <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                        <div>
                            <p className="ml-2 font-bold">Error fetching character</p>
                            <p className="ml-2 text-xs">Character might not exists or not above level 10</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}