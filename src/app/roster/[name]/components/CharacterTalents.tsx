import {
    ClassSpecialization,
    getClassTalents, TalentsPlaceholder
} from "@/app/roster/[name]/components/talents/talentsPlaceholders";
import {TalentTree} from "@/app/roster/[name]/components/talents/TalentTree";
import {CharacterViewOptions} from "@/app/roster/[name]/components/CharacterViewOptions";

type Talent = {
    talent?: { id: number }
    spell_tooltip?: {
        spell?: {
            id: number
            name: string
        }
        description: string
        cast_time: string
        power_cost: string
        range: string
    }
    talent_rank?: number
}


export function CharacterTalents({talents, characterInfo}: {
    talents: any,
    characterInfo?: any
}) {
    const [specializations_groups] = talents?.specialization_groups || []
    const {specializations} = specializations_groups

    const className: string = (characterInfo?.character_class?.name as string) || ''
    const specializationsPlaceholder: ClassSpecialization = getClassTalents(className)

    if (!specializationsPlaceholder) {
        return <div>Class not found '{className}'</div>
    }

    const talentsKeys = Object.keys(specializationsPlaceholder)

    return (
        <div className="w-full h-full">
            <div className="lg:hidden flex w-full h-full justify-center items-center">
                <CharacterViewOptions
                    bottom
                    items={
                        talentsKeys.map((specName, index) => {
                            // @ts-ignore
                            const specializationPlaceHolder = specializationsPlaceholder[specName] as TalentsPlaceholder
                            const specialization = specializations.find((spec: any) => spec.specialization_name.replaceAll(' ', '') === specName)
                            return {
                                label: specName,
                                name: specName,
                                children: (
                                    <div className="flex justify-center">
                                        <TalentTree
                                            key={index}
                                            specializationPlaceholder={specializationPlaceHolder}
                                            specialization={specialization}
                                            name={specName}
                                        />
                                    </div>
                                )
                            }
                        })
                    }/>
            </div>
            <div className="items-center justify-evenly hidden lg:flex">
                {
                    talentsKeys.map((specName, index) => {
                        // @ts-ignore
                        const specializationPlaceHolder = specializationsPlaceholder[specName] as TalentsPlaceholder
                        const specialization = specializations.find((spec: any) => spec.specialization_name.replaceAll(' ', '') === specName)
                        return (
                            <TalentTree
                                key={index}
                                specializationPlaceholder={specializationPlaceHolder}
                                specialization={specialization}
                                name={specName}
                            />
                        )
                    })
                }
            </div>
        </div>
    )
}


