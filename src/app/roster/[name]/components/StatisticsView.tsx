import {Health} from "@/app/roster/[name]/components/spell-svgs/Health";
import {Stamina} from "@/app/roster/[name]/components/spell-svgs/Stamina";
import {FireResistance} from "@/app/roster/[name]/components/spell-svgs/FireResistance";
import {Defense} from "@/app/roster/[name]/components/spell-svgs/Defense";
import {Strength} from "@/app/roster/[name]/components/spell-svgs/Strength";
import {Agility} from "@/app/roster/[name]/components/spell-svgs/Agility";
import {Intellect} from "@/app/roster/[name]/components/spell-svgs/Intellect";
import {Rage} from "@/app/roster/[name]/components/spell-svgs/Rage";
import {Energy} from "@/app/roster/[name]/components/spell-svgs/Energy";
import {Mana} from "@/app/roster/[name]/components/spell-svgs/Mana";

function Power({amount, name}: { amount: number, name: string }) {
    const text = name === 'Rage' ? 'text-red-500' : name === 'Energy' ? 'text-yellow-500' : 'text-blue-500'
    const Icon = () => {
        if (name === 'Rage') {
            return <Rage className={`w-16 h-16 ${text}`}/>
        }
        if (name === 'Energy') {
            return <Energy className={`w-16 h-16 ${text}`}/>
        }

        return <Mana className={`w-16 h-16 ${text}`}/>
    }
    return (
        <div className="flex flex-row gap-2 w-40">
            <Icon/>
            <div className="flex-col flex self-end pb-1">
                <span className={`${text} font-bold`}>{amount}</span>
                <span className="text-white">{name}</span>
            </div>
        </div>
    )
}

export function StatisticsView({statistics}: { statistics: any }) {
    const characterStatistics = {
        health: statistics?.health || 0,
        power: {
            amount: statistics?.power || 0,
            name: statistics?.power_type?.name || 'Unknown'
        },
        strength: statistics?.strength?.effective || 0,
        agility: statistics?.agility?.effective || 0,
        intellect: statistics?.intellect?.effective || 0,
        stamina: statistics?.stamina?.effective || 0,
        armor: statistics?.armor?.effective || 0,
        dodge: statistics?.dodge?.value || 0,
        parry: statistics?.parry?.value || 0,
        block: statistics?.block?.value || 0,
        melee_crit: statistics?.melee_crit?.value || 0,
        ranged_crit: statistics?.ranged_crit?.value || 0,
        spell_crit: statistics?.spell_crit?.value || 0,
        /* melee_hit: statistics?.melee_hit?.effective || 0,
         ranged_hit: statistics?.ranged_hit?.effective || 0,
         spell_hit: statistics?.spell_hit?.effective || 0,*/ // these are not in the response TODO: to grab those from the loot
        defense: statistics?.defense?.effective || 0,
        spirit: statistics?.spirit?.effective || 0,
        resistances: {
            fire: statistics?.fire_resistance?.effective || 0,
            holy: statistics?.holy_resistance?.effective || 0,
            shadow: statistics?.shadow_resistance?.effective || 0,
            nature: statistics?.nature_resistance?.effective || 0,
            arcane: statistics?.arcane_resistance?.effective || 0,
        }
    }


    return (
        <div className="flex lg:flex-col gap-4 items-center justify-center w-full">
            <div
                className="flex lg:flex-row flex-col gap-8 w-full lg:items-center justify-center">
                <div className="flex flex-row gap-2 w-40">
                    <Health className="text-red-500 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-red-500 font-bold">{characterStatistics.health}</span>
                        <span className="text-white">Health</span>
                    </div>
                </div>
                <Power amount={characterStatistics.power.amount} name={characterStatistics.power.name}/>
                <div className="flex flex-row gap-2 w-40">
                    <Stamina className="text-orange-400 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-orange-400 font-bold">{characterStatistics.stamina}</span>
                        <span className="text-white">Stamina</span>
                    </div>
                </div>

                <div className="flex flex-row gap-2 w-40">
                    <FireResistance className="text-red-500 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-red-500 font-bold">{characterStatistics.resistances.fire}</span>
                        <span className="text-white">Fire res.</span>
                    </div>
                </div>
                {/* TODO not needed for now
                <div className="flex flex-row gap-2 w-40">
                    <ShadowResistance className="text-purple-500 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-purple-500 font-bold">{characterStatistics.resistances.shadow}</span>
                        <span className="text-white">Shadow res.</span>
                    </div>
                </div>*/}

            </div>
            <div className="flex lg:flex-row flex-col gap-8 w-full lg:items-center justify-center">
                <div className="flex flex-row gap-2 w-40">
                    <Strength className="text-red-500 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-red-500 font-bold">{characterStatistics.strength}</span>
                        <span className="text-white">Strength</span>
                    </div>
                </div>
                <div className="flex flex-row gap-2 w-40">
                    <Agility className="text-yellow-500 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-yellow-500 font-bold">{characterStatistics.agility}</span>
                        <span className="text-white">Agility</span>
                    </div>
                </div>
                <div className="flex flex-row gap-2 w-40">
                    <Intellect className="text-purple-400 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-purple-400 font-bold">{characterStatistics.intellect}</span>
                        <span className="text-white">Intellect</span>
                    </div>
                </div>
                <div className="flex flex-row gap-2 w-40">
                    <Defense className="text-gray-500 w-16 h-16"/>
                    <div className="flex-col flex self-end pb-1">
                        <span className="text-gray-500 font-bold">{characterStatistics.defense}</span>
                        <span className="text-white">Defense</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
