'use client'
import {
    ClassSpecialization,
    getClassTalents, TalentsPlaceholder
} from "@/app/roster/[name]/components/talents/talentsPlaceholders";
import {TalentTree} from "@/app/roster/[name]/components/talents/TalentTree";
import {CharacterViewOptions} from "@/app/roster/[name]/components/CharacterViewOptions";
import {useState} from "react";
import {Tooltip} from "@nextui-org/react";

export const getTalentTreeIconUrl = (className: string, talentName: string) => {
    return `/talents-spec/${className.toLowerCase()}/${talentName.replaceAll(' ', '')}.jpg`
}

export function CharacterTalents({talents, characterInfo}: {
    talents: any,
    characterInfo?: any
}) {
    const talentGroups = (talents?.specialization_groups ?? []).map((group: any) => {
        const specializationName = group.specializations.sort((a: any, b: any) => {
            return b.spent_points - a.spent_points
        })[0]?.specialization_name
        return {
            specializationName,
            is_active: group.is_active,
            specializations: group.specializations
        }
    })

    const activeSpec = talentGroups.find((group: any) => group.is_active)?.specializations ?? []
    const [specializations, setSpecializations] = useState(activeSpec)


    const className: string = (characterInfo?.character_class?.name as string) || ''
    const specializationsPlaceholder: ClassSpecialization = getClassTalents(className)

    if (!specializationsPlaceholder) {
        return <div>Class not found '{className}'</div>
    }

    const talentsKeys = Object.keys(specializationsPlaceholder)

    return (
        <div className="w-full h-full relative">
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
                                            treeIconUrl={getTalentTreeIconUrl(className, specName)}
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
                                treeIconUrl={getTalentTreeIconUrl(className, specName)}
                                specializationPlaceholder={specializationPlaceHolder}
                                specialization={specialization}
                                name={specName}
                            />
                        )
                    })
                }
            </div>
            <div className="flex flex-col gap-2 w-16 absolute -right-2 lg:-right-12 top-1 z-10">
                {talentGroups.map((group: any, index: number) => {
                    const {specializationName, is_active} = group
                    const iconUrl = getTalentTreeIconUrl(className, specializationName)

                    return (
                        <div key={index} className="flex">
                            <Tooltip
                                content={specializationName}
                                placement="right"
                            >
                                <div
                                    onClick={() => setSpecializations(group.specializations)}
                                    className={`w-8 h-8 bg-cover bg-center bg-no-repeat rounded-lg ${is_active ? '' : 'grayscale'} cursor-pointer ${specializations == group.specializations ? 'border border-gold' : 'border border-transparent'}`}
                                    style={{backgroundImage: `url(${iconUrl})`}}
                                />
                            </Tooltip>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


