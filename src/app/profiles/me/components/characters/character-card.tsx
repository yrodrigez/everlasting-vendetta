import { Avatar } from "@heroui/react";
import { Character } from "./types";

const classColors: Record<string, string> = {
    warrior: "warrior",
    paladin: "paladin",
    hunter: "hunter",
    rogue: "rogue",
    priest: "priest",
    shaman: "shaman",
    mage: "mage",
    warlock: "warlock",
    druid: "druid",
    deathknight: "deathknight",
    monk: "monk",
    demonhunter: "demonhunter",
};

export function CharacterCard({ character, isSelected, onSelect }: {
    character: Character;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const colorClass = classColors[character.className.toLowerCase()] || "priest";

    return (
        <div
            onClick={onSelect}
            className={`
        relative cursor-pointer rounded-lg border p-3 transition-all duration-200
        bg-wood-900 hover:bg-wood
        ${isSelected ? `border-${colorClass} shadow-lg` : "border-wood-100 hover:border-stone"}
      `}
        >
            <div className="flex flex-col items-center gap-2">
                <Avatar
                    className={`w-16 h-16 border-2 border-${colorClass}`}
                    src={character.avatar}
                    fallback={
                        <div className={`w-full h-full bg-${colorClass} bg-opacity-30 flex items-center justify-center`}>
                            <span className={`text-${colorClass} text-xl font-bold`}>
                                {character.name.charAt(0)}
                            </span>
                        </div>
                    }
                />

                <div className="text-center">
                    <p className={`text-${colorClass} font-semibold text-sm`}>
                        {character.name}
                    </p>
                    <p className="text-stone-100 text-xs">{character.realm}</p>
                    <p className="text-stone-100 text-xs">Lvl {character.level}</p>
                </div>
            </div>
        </div>
    );
}