import {TalentTooltip} from "@/app/roster/[name]/components/talents/TalentTooltip";

function findTalentInSpecialization(talent: any, specialization: any) {
    return specialization?.talents?.find((talentSpec: any) => talentSpec.spell_tooltip?.spell?.name === talent.name)
}

export function TalentTree({specializationPlaceholder, specialization, name, treeIconUrl}: {
    specializationPlaceholder: any,
    specialization: any,
    name: string,
    treeIconUrl?: string
}) {
    return (
        <div>
            <div className="text-xl text-gold"><div
                className="w-8 h-8 bg-cover bg-center bg-no-repeat inline-block rounded mr-2"
                style={{backgroundImage: `url(${treeIconUrl})`}}
            ></div>{name} ({specialization ? specialization.spent_points : 0})</div>
            <div
                className="p-2 bg-cover bg-center bg-no-repeat flex flex-col rounded border border-gold/30 shadow-2xl shadow-gold"
                style={{backgroundImage: `url(${specializationPlaceholder.background})`}}>
                {specializationPlaceholder.talents.map((row: any, rowIndex: number) => (
                    <div key={rowIndex} className="flex gap-2">
                        {row.map((item: any, columnIndex: number) => {
                            const foundTalent = findTalentInSpecialization(item, specialization)
                            const spentPoints = foundTalent?.talent_rank || 0

                            return (<div key={columnIndex}
                                         className="p-2 relative">
                                    <div
                                        className={`w-11 h-11 bg-cover max-w-11 min-w-11 rounded-lg ${foundTalent && foundTalent.talent_rank ? '' : 'grayscale'}`}
                                        style={item.skip ? {} : {backgroundImage: `url('${item.src}')`}}
                                    >
                                        {foundTalent && (
                                            <TalentTooltip
                                                maxPoints={item.maxPoints}
                                                talent={foundTalent}/>
                                        )}
                                    </div>
                                    {!item.skip && (
                                        <div
                                            className={`absolute bottom-0 right-0 bg-black text-${spentPoints === 0 ? 'white' :
                                                spentPoints === item.maxPoints ? 'yellow-400' : 'uncommon'
                                            } text-xs px-1 rounded border border-white/30 ${
                                                spentPoints === 0 ? 'opacity-50' : ''
                                            }${
                                                spentPoints === 0 ? 'border-white/30' :
                                                    spentPoints === item.maxPoints ? 'yellow-400/30' : 'border-uncommon/30'
                                            }`}>
                                            {spentPoints} / {item.maxPoints}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    )
}

/**/
