'use client';

import { useAuth } from '@/context/AuthContext';
import { useAllowedRealms } from '@/hooks/api/use-allowed-realms';
import { useUserCharacters } from '@/hooks/use-user-charcters';
import { useModal } from '@/hooks/useModal';
import { createAPIService } from "@/lib/api";
import { useMessageBox } from '@/util/msgBox';
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, ScrollShadow } from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCharacterStore } from "../characterStore";
import { Role } from "./role-selection";
import { useVistaStore } from "./vista-store";

function WelcomeVideo() {
    const [phase, setPhase] = useState<'intro' | 'playing'>('intro');
    const videoRef = useRef<HTMLVideoElement>(null);
    const { close } = useModal();

    const handleOk = () => {
        setPhase('playing');
        setTimeout(() => videoRef.current?.play(), 100);
    };

    const handleVideoEnd = () => {
        close();
    };

    if (phase === 'intro') {
        return (
            <div className="flex flex-col items-center gap-6 py-2">
                {/* Guild crest */}
                <img
                    src="/center-img.webp"
                    alt="Everlasting Vendetta"
                    className="w-48 h-48 rounded-full"
                />

                {/* Decorative divider */}
                <div className="flex items-center gap-3 w-full px-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                    <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">A Message from Vendetto</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                </div>

                {/* Message content */}
                <div className="flex flex-col gap-3 text-center px-6">
                    <p className="text-stone-100 text-lg leading-relaxed">
                        Greetings, adventurer. I am <span className="text-gold font-semibold">Vendetto</span>, and I bid you welcome to <span className="text-gold font-semibold">Everlasting Vendetta</span>.
                    </p>
                    <p className="text-wood-50 leading-relaxed">
                        Your legend begins here. Link your first character to unlock everything our guild has to offer &mdash; from raid planning and loot tracking to achievements and beyond.
                    </p>
                    <p className="text-wood-50/70 text-sm italic">
                        Press below and I shall show you the way.
                    </p>
                </div>

                {/* Decorative divider */}
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

                {/* CTA button */}
                <Button
                    className="bg-moss text-gold border border-moss-100 rounded px-8 py-2 text-base tracking-wide glow-animation"
                    onPress={handleOk}
                    size="lg"
                >
                    Begin Your Journey
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden">
                {/* Cavern vignette overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none rounded-xl"
                    style={{
                        boxShadow: 'inset 0 0 60px 30px rgba(0,0,0,0.95), inset 0 0 120px 60px rgba(0,0,0,0.7)',
                        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(30,20,10,0.6) 70%, rgba(10,5,0,0.95) 100%)',
                    }}
                />
                {/* Jagged stalactites (top) */}
                <div className="absolute top-0 left-0 right-0 h-6 z-10 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to bottom, rgba(20,12,5,1) 0%, rgba(30,18,8,0.8) 40%, transparent 100%)',
                        clipPath: 'polygon(0 0, 100% 0, 100% 40%, 92% 70%, 85% 45%, 75% 80%, 65% 50%, 55% 90%, 45% 55%, 35% 85%, 25% 50%, 15% 75%, 8% 40%, 0 60%)',
                    }}
                />
                {/* Jagged stalagmites (bottom) */}
                <div className="absolute bottom-0 left-0 right-0 h-6 z-10 pointer-events-none"
                    style={{
                        background: 'linear-gradient(to top, rgba(20,12,5,1) 0%, rgba(30,18,8,0.8) 40%, transparent 100%)',
                        clipPath: 'polygon(0 60%, 5% 30%, 12% 70%, 20% 25%, 30% 55%, 40% 15%, 50% 50%, 60% 20%, 70% 60%, 80% 30%, 88% 55%, 95% 25%, 100% 50%, 100% 100%, 0 100%)',
                    }}
                />
                {/* Rock edges (left/right) */}
                <div className="absolute top-0 bottom-0 left-0 w-5 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to right, rgba(20,12,5,1) 0%, rgba(30,18,8,0.7) 50%, transparent 100%)' }}
                />
                <div className="absolute top-0 bottom-0 right-0 w-5 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to left, rgba(20,12,5,1) 0%, rgba(30,18,8,0.7) 50%, transparent 100%)' }}
                />
                <video ref={videoRef} className="rounded-xl w-full" playsInline onEnded={handleVideoEnd}>
                    <source src="/welcome/vendetto-welcome.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}

const CharacterView = ({ character }: { character: any }) => {
    const { setSelectedCharacter, selectedCharacter } = useCharacterStore(state => state);
    const api = createAPIService();
    const { alert } = useMessageBox();
    const onSelect = useCallback(async () => {
        if (selectedCharacter?.id === character.id) {
            return;
        }
        try {
            await Promise.all([
                api.characters.setSelected(character.id),
                api.analytics.sendEvent({
                    event_name: 'character_selected',
                    event_type: 'character_selection',
                    metadata: {
                        character_id: character.id,
                        character_name: character.name,
                        character_level: character.level,
                        character_class: character.className,
                        realm_name: character.realm?.name,
                    }
                })
            ]);
            setSelectedCharacter(character);

        } catch (error) {
            console.error('Error selecting character:', error);
            alert({
                title: 'Error selecting character',
                message: 'An error occurred while selecting the character. Please try again.',
                type: 'error',
            });
        }

    }, [character, selectedCharacter, setSelectedCharacter, api.characters, api.analytics, alert]);

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
                title: 'Welcome to Everlasting Vendetta!',
                message: <WelcomeVideo />,
                type: 'window',
                hideCloseButton: true,
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
                // Keep selected character on top
                if (selectedCharacter?.id === a.id) return -1;
                if (selectedCharacter?.id === b.id) return 1;
                // Then sort by level descending
                if (a.level > b.level) return -1;
                if (a.level < b.level) return 1;
                // Finally sort by name ascending
                return a.name.localeCompare(b.name);
            }).filter((character: any) => allowedRealms.map((realm: { name: string }) => realm.name).includes(character.realm.name)).map((character: any) => (
                <CharacterView key={character.id} character={character} />
            ))}
        </ScrollShadow>
    );
}
