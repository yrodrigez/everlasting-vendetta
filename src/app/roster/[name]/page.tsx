import CharacterAvatar from "@/app/components/CharacterAvatar";
import {fetchItemDetails} from "@/app/components/CharacterItem";
import {calculateTotalGearScore, getColorForGearScoreText} from "@/app/roster/[name]/ilvl";
import {CharacterGear} from "@/app/roster/[name]/components/CharacterGear";
import {CharacterViewOptions} from "@/app/roster/[name]/components/CharacterViewOptions";
import {CharacterTalents} from "@/app/roster/[name]/components/CharacterTalents";
import Image from 'next/image'
import moment from "moment";
import {cookies} from "next/headers";
import {Tooltip} from "@nextui-org/react";

import {getBlizzardToken} from "@/app/lib/getBlizzardToken";
import WoWService from "@/app/services/wow-service";

const getPlayerClassById = (classId: number) => {
    const classes = {
        1: {name: 'Warrior', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warrior.jpg'},
        2: {name: 'Paladin', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_paladin.jpg'},
        3: {name: 'Hunter', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_hunter.jpg'},
        4: {name: 'Rogue', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_rogue.jpg'},
        5: {name: 'Priest', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_priest.jpg'},
        7: {name: 'Shaman', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_shaman.jpg'},
        8: {name: 'Mage', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_mage.jpg'},
        9: {name: 'Warlock', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warlock.jpg'},
        11: {name: 'Druid', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_druid.jpg'},
    } as any

    return classes[classId] || {name: 'Unknown', icon: 'unknown'}
}

const findItemBySlotType = (equipment: any, slotType: string) => {
    return equipment.find((item: any) => item.slot.type === slotType) || {
        slot: {type: slotType},
        item: {id: 999999},
        quality: {type: 'POOR', name: 'poor'},
        level: 0,
        name: 'Unknown'
    }
}

const findEquipmentBySlotTypes = (equipment: any, slots: string[]) => {
    const result = [] as any
    slots.forEach((slot) => {
        result.push(findItemBySlotType(equipment, slot))
    })

    return result
}

function getQualityTypeNumber(quality: string) {
    const qualityTypes = {
        'POOR': 0,
        'COMMON': 1,
        'UNCOMMON': 2,
        'RARE': 3,
        'EPIC': 4,
        'LEGENDARY': 5,
    } as any

    return qualityTypes[quality] || 0
}

export default async function Page({params}: { params: { name: string } }) {
    const cookieToken = cookies().get(process.env.BNET_COOKIE_NAME!)?.value
    const {token} = (cookieToken ? {token: cookieToken} : (await getBlizzardToken()))

    const {fetchMemberInfo, fetchEquipment, isLoggedUserInGuild, getCharacterTalents} = new WoWService()
    const [isGuildMember, characterInfo, equipment, talents] = await Promise.all([
        isLoggedUserInGuild(),
        fetchMemberInfo(params.name),
        fetchEquipment(params.name),
        getCharacterTalents(params.name)
    ])


    const equipmentData = await Promise.all(equipment.equipped_items.map(async (item: any) => {
        const response = await fetchItemDetails(token, item.item.id)
        return {
            ...item,
            details: response
        }
    }))

    const group1 = findEquipmentBySlotTypes(equipmentData, ['HEAD', 'NECK', 'SHOULDER', 'BACK', 'CHEST', 'SHIRT', 'TABARD', 'WRIST'])
    const group2 = findEquipmentBySlotTypes(equipmentData, ['HANDS', 'WAIST', 'LEGS', 'FEET', 'FINGER_1', 'FINGER_2', 'TRINKET_1', 'TRINKET_2'])
    const group3 = findEquipmentBySlotTypes(equipmentData, ['MAIN_HAND', 'OFF_HAND', 'RANGED'])
    const gearForGearScore = [...group1, ...group2, ...group3].filter((item: any) => item?.slot?.type !== 'SHIRT' && item?.slot?.type !== 'TABARD').map((item: any) => {
        return {
            ilvl: item.details?.level || 0,
            type: `INVTYPE_${item.inventory_type?.type}`,
            rarity: getQualityTypeNumber(item.quality?.type),
            isEnchanted: !!(item.enchantments?.length)
        }
    }).filter(item => item.ilvl !== 0 || item.type !== 'INVTYPE_')
    const gearScore = gearForGearScore !== null ? calculateTotalGearScore(gearForGearScore) : 0
    const gearScoreColorName = `text-${getColorForGearScoreText(gearScore)}`


    return (
        <div>
            <div className="mx-auto max-w-6xl px-4 flex justify-evenly items-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                        <CharacterAvatar token={token} realm={'lone-wolf'} characterName={characterInfo.name}
                                         className="rounded-full border-3 border-gold"/>
                    </div>
                    <div className="grid gap-1.5">
                        <h2 className="font-semibold text-lg">{characterInfo.name}</h2>
                        <p className="text-sm text-muted">
                            Level {characterInfo.level} {characterInfo.race.name} {characterInfo.character_class?.name}
                        </p>
                        <p className="text-sm text-muted">Last online: <span
                            className={`font-bold relative`}>
                            {isGuildMember ? moment(characterInfo?.last_login_timestamp).format('MMMM D HH:MM') : 'no seas porco'}
                            {!isGuildMember ? <Tooltip
                                placement="right"
                                showArrow
                                className="bg-wood text-white p-2 rounded"
                                content={'You must be a guild member to see this information'}
                            >
                                <span className={
                                    `absolute left-0 right-0 -top-1 -bottom-1 rounded backdrop-filter backdrop-blur backdrop-saturate-150 backdrop-contrast-50 bg-gold blur-sm`}/>
                            </Tooltip> : null}
                        </span>
                        </p>
                        <p className="text-sm text-muted">Gear score: <span
                            className={`${gearScoreColorName} font-bold`}>{gearScore}</span></p>
                    </div>
                </div>
                <Image
                    width={56}
                    height={56}
                    className={'rounded-full'}
                    alt={characterInfo.character_class?.name}
                    src={getPlayerClassById(characterInfo.character_class?.id).icon}/>
            </div>
            <CharacterViewOptions
                items={[
                    {
                        label: 'Gear', name: 'gear', children: <CharacterGear gear={{
                            group1,
                            group2,
                            group3
                        }} token={token}/>
                    },
                    {
                        label: 'Talents', name: 'talents', children: <CharacterTalents
                            characterInfo={characterInfo}
                            talents={talents}
                        />
                    },
                ]}
            />
        </div>
    )
}
