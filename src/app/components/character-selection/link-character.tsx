'use client';
import { Input } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAllowedRealms } from "../../hooks/api/use-allowed-realms";
import { useFetchCharacter } from "../../hooks/api/use-fetch-character";
import { Button } from ".././Button";
import LookupField from ".././LookupField";
import { LinkCharacterView } from "./link-character-views";
import api from "@/app/lib/api";
import { useMessageBox } from "@/app/util/msgBox";
import { useInvalidateUserCharacters } from "@/app/hooks/use-user-charcters";
import { useVistaStore } from "./vista-store";

const TYPING_DEBOUNCE_MS = 500;

export function LinkCharacter() {
    const { allowedRealms, isLoading, error: errorRealms } = useAllowedRealms();
    const { character, fetchCharacter, isError, isPending } = useFetchCharacter()
    const [selectedRealm, setSelectedRealm] = useState<string | null>(null);
    const [characterName, setCharacterName] = useState<string>('');
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const values = useMemo<Set<{ label: string, slug: string }>>(() => {
        return new Set(allowedRealms?.map((realm: { slug: string, name: string }) => ({ label: realm.name, slug: realm.slug })) ?? []);
    }, [allowedRealms]);

    const triggerFetch = useCallback(() => {
        const sanitized = characterName.trim();
        if (!selectedRealm || sanitized.length < 3) {
            return;
        }

        fetchCharacter({ realm: selectedRealm, name: sanitized });
    }, [characterName, selectedRealm, fetchCharacter]);

    const { alert } = useMessageBox()

    const triggerImmediateFetch = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        triggerFetch();
    }, [triggerFetch]);

    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        const sanitized = characterName.trim();
        if (!selectedRealm || sanitized.length < 3) {
            return;
        }

        typingTimeoutRef.current = setTimeout(() => {
            triggerFetch();
            typingTimeoutRef.current = null;
        }, TYPING_DEBOUNCE_MS);

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        };
    }, [characterName, selectedRealm, triggerFetch]);

    const invalidateCharacters = useInvalidateUserCharacters();
    const setActiveVista = useVistaStore(state => state.setVista);

    const onLinkCharacter = useCallback(() => {
        if (!character) {
            return;
        }
        if (!selectedRealm) {
            return;
        }

        api.post('auth/characters/link', {
            realmSlug: selectedRealm,
            characterName: character.name,
        }).then(() => {
            alert({ type: 'success', message: `Character ${character.name} linked successfully!` });
            invalidateCharacters();
            setActiveVista('list');
        }).catch((error) => {
            console.error('Error linking character:', error);
            alert({ type: 'error', message: 'Error linking character: ' + (error?.response?.data?.message || error.message || 'Unknown error') });
            return;
        });

    }, [allowedRealms, selectedRealm, characterName, character]);

    if (errorRealms) {
        return <div>Error loading realms</div>;
    }

    return (
        <div
            className={`relative flex flex-col gap-4 w-full h-full justify-center items-center p-2 min-w-full`}
        >
            <LookupField
                title="Realm"
                value={selectedRealm ?? 'Realm'}
                onChange={(selectedValue: string) => selectedValue !== 'Realm' && setSelectedRealm(selectedValue)}
                values={values}
            />
            <Input
                disabled={!selectedRealm}
                onChange={(e) => setCharacterName(e.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        triggerImmediateFetch();
                    }
                }}
                placeholder={selectedRealm ? "Character Name" : "Select a realm first"}
                size="lg"
                value={characterName}
            />
            <div className="flex flex-col gap-4 w-full items-center">
                <LinkCharacterView character={character} isLoaded={(!!character && !isPending)} isError={isError} isLoading={isPending || isLoading} />
                <Button
                    onPress={onLinkCharacter}
                    isDisabled={!character || isPending || isError}
                    className="w-full"
                    size="lg"
                >Link to my account</Button>
            </div>
        </div>
    );
}