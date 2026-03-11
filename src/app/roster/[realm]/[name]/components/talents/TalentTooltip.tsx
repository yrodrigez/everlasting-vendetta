'use client'
import {Tooltip} from "@heroui/react";

export function TalentTooltip({talent, maxPoints}: { talent: any, maxPoints: number}) {
    const {spell_tooltip} = talent
    const {name} = spell_tooltip?.spell || {name: ''}
    const {description} = spell_tooltip || {description: ''}
    return (
        <Tooltip
            className="bg-black border border-white/30 rounded max-w-md p"
            showArrow
            content={
                <div className="flex flex-col gap p-1">
                    <h4 className="text-white text-lg font-bold">{name}</h4>
                    <h4 className="text-white">Rank {talent.talent_rank}/{maxPoints}</h4>
                    <p className="text-yellow-500 text-sm">{description}</p>
                </div>
            }
        >
        <div className="w-full h-full">

        </div>
        </Tooltip>
    )
}
