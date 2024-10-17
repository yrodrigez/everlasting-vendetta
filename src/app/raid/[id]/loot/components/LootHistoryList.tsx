'use client'
import {LootItem} from "@/app/raid/[id]/loot/components/LootItem";
import {CharacterWithLoot} from "@/app/raid/[id]/loot/components/types";
import {useEffect, useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import autoAnimate from '@formkit/auto-animate'

export default function LootHistoryList({lootHistory}: { lootHistory: CharacterWithLoot[] }) {

    const parent = useRef(null)
    useEffect(() => {
        parent.current && autoAnimate(parent.current, (el, action) => {
            let keyframes
            if (action === 'add') {
                //should come from the top and pop in
                keyframes = [
                    {transform: 'scale(0)', opacity: 0},
                    {transform: 'translateY(-100%)', opacity: 0},
                    {transform: 'translateY(0)', opacity: 1},
                    {transform: 'scale(1.15)', opacity: 1},
                    {transform: 'scale(1)', opacity: 1},


                ]
            }
            if (action === 'remove') {
                //should go up and fade out
                keyframes = [
                    {transform: 'translateY(0)', opacity: 1},
                    {transform: 'translateY(-100%)', opacity: 0}
                ]

            }
            if (action === 'remain') {
                //should stay in place
                keyframes = [
                    {transform: 'translateY(0)', opacity: 1},
                    {transform: 'translateY(0)', opacity: 1}
                ]
            }
            return new KeyframeEffect(el, keyframes ?? [], {duration: 300, easing: 'ease-in'})
        })
    }, [parent]);


    return (
        <div className="flex h-full w-full relative justify-center" ref={parent}>
            <div className="flex h-full gap-4 p-2 scrollbar-pill overflow-auto items-start justify-evenly flex-wrap relative">
                {lootHistory.map((loot, i) => {
                    return <LootItem key={i} loot={loot}/>
                })}

            </div>
            {false && (
                <div className="fixed z-10 flex justify-center items-center rounded-full">
                    <div
                        className="p-8 w-8 h-8 rounded-full border border-white flex justify-center items-center bg-dark shadow-white shadow-lg hover:shadow-gold">
                        <FontAwesomeIcon icon={faTrash}/>
                    </div>
                </div>
            )}
        </div>
    )
}
