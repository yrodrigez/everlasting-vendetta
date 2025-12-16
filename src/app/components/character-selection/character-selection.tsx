'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LinkCharacter } from "./link-character";
import { CharactersSelectionList } from "./characters-selection-list";
import { RoleSelection } from "./role-selection";
import { useVistaStore } from "./vista-store";
import { useCharacterStore } from "../characterStore";

const VISTAS = [
    { id: "link", label: "Link character", render: () => <LinkCharacter /> },
    { id: "list", label: "My characters", render: () => <CharactersSelectionList /> },
    { id: "role-selection", label: "Select role", render: () => <RoleSelection /> },
] as const;

export function CharacterSelection({ isBattlenet }: { isBattlenet?: boolean }) {
    const activeVista = useVistaStore(state => state.vista);
    const setActiveVista = useVistaStore(state => state.setVista);
    const vistas = useMemo(() => VISTAS.filter(view => !(isBattlenet && view.id === "link")), [isBattlenet]);
    const activeIndex = useMemo(() => {
        return vistas.findIndex(view => view.id === activeVista);
    }, [activeVista, vistas]);
    const slideWidth = 100 / vistas.length;
    const vistaRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [containerHeight, setContainerHeight] = useState<number | null>(null);
    const updateHeight = () => {
        const activeVista = vistaRefs.current[activeIndex];
        if (!activeVista) {
            return;
        }

        const { height } = activeVista.getBoundingClientRect();
        setContainerHeight(height);
    };

    useLayoutEffect(() => {
        updateHeight();

        const activeSlide = vistaRefs.current[activeIndex];
        if (!activeSlide) {
            return;
        }

        const resizeObserver = new ResizeObserver(() => updateHeight());
        resizeObserver.observe(activeSlide);

        return () => {
            resizeObserver.disconnect();
        };
    }, [activeIndex]);

    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    useEffect(() => {
        if (selectedCharacter && !selectedCharacter.selectedRole) {
            setActiveVista('role-selection');
        }
    }, [vistas, selectedCharacter, setActiveVista, activeIndex, activeVista]);

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            {vistas?.length > 1 && (<div className="flex items-center gap-2 bg-wood-900/60 p-1 rounded-xl">
                {vistas.map((view, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <button
                            disabled={isBattlenet && view.id === "link"}
                            key={view.id}
                            className={`flex-1 px-2 py-1 rounded-lg text-sm font-semibold transition-all duration-200
                                ${isActive
                                    ? "bg-gold text-wood-900 shadow-lg"
                                    : "bg-transparent text-gold/70 hover:text-gold"
                                }`}
                            onClick={() => setActiveVista(view.id)}
                        >
                            {view.label}
                        </button>
                    );
                })}
            </div>)}
            <div
                className="relative overflow-hidden w-full"
                style={{
                    height: containerHeight ? `${containerHeight}px` : undefined,
                    transition: "height 300ms ease",
                }}
            >
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                        width: `${vistas.length * 100}%`,
                        transform: `translateX(-${activeIndex * slideWidth}%)`,
                    }}
                >
                    {vistas.map((view, index) => (
                        <div
                            key={view.id}
                            className={`flex-shrink-0 px-1 transition-opacity duration-400 ${index === activeIndex ? 'opacity-100' : 'opacity-10'}`}
                            style={{ width: `${slideWidth}%` }}
                            ref={(element) => {
                                vistaRefs.current[index] = element;
                            }}
                        >
                            {view.render()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
