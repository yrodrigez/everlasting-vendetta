import axios from "axios";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import CharacterItem, {fetchItemDetails} from "@/app/components/CharacterItem";
import {calculateTotalGearScore, getColorForGearScoreText} from "@/app/roster/[name]/ilvl";

function fetchMemberInfo(token: string, realm: string, characterName: string, locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}`;
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token);

    return axios.get(`${url}?locale=${locale}&namespace=profile-classic1x-eu`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

const getBlizzardToken = async () => {
    const url: string = `https://ijzwizzfjawlixolcuia.supabase.co/functions/v1/everlasting-vendetta`
    const jwt: string = `Bearer ` + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await axios.get(url, {
        headers: {
            'Authorization': jwt
        }
    })

    return response.data
}

async function fetchEquipment(token: string, realm: string, characterName: string, locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}/equipment?namespace=profile-classic1x-eu&locale=${locale}`
    return axios.get(`${url}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

async function fetchSpecialization(token: string, realm: string, characterName: string, locale: string = 'en_US') {
    const url = `https://eu.api.blizzard.com/profile/wow/character/${realm}/${characterName}/specializations?namespace=profile-classic1x-eu&locale=${locale}`
    return axios.get(`${url}`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })
}

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
    const {token} = await getBlizzardToken()
    const {data: characterInfo} = await fetchMemberInfo(token, 'lone-wolf', params.name)
    const {data: equipment} = await fetchEquipment(token, 'lone-wolf', params.name)
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
    const toCalcIlvl = [...group1, ...group2, ...group3].filter((item: any) => item?.slot?.type !== 'SHIRT' && item?.slot?.type !== 'TABARD').map((item: any) => {
        return {
            ilvl: item.details?.level || 0,
            type: `INVTYPE_${item.inventory_type?.type}`,
            rarity: getQualityTypeNumber(item.quality?.type),
            isEnchanted: !!(item.enchantments?.length)
        }
    }).filter(item => item.ilvl !== 0 || item.type !== 'INVTYPE_')
    const ilvl = toCalcIlvl !== null ? calculateTotalGearScore(toCalcIlvl) : 0
    const getColorName = `text-${getColorForGearScoreText(ilvl)}`

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
                        <p className="text-sm text-muted">Level {characterInfo.level} {characterInfo.race.name} {characterInfo.character_class?.name}</p>
                        <p className="text-sm text-muted">Last
                            online {new Date(characterInfo.last_login_timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <img className={'rounded-full'} alt={characterInfo.character_class?.name}
                     src={getPlayerClassById(characterInfo.character_class?.id).icon}/>
            </div>
            <div className="w-full h-full flex flex-col items-center">
                <div className="w-full flex justify-between items-center">
                    <div className="flex flex-1 gap-4 flex-col">
                        {group1.map((item: any, index: number) => {
                            return <CharacterItem key={'item-' + index} item={item} token={token}/>
                        })}
                    </div>
                    <div>
                        Item level: <span className={`${getColorName} font-bold`}>{ilvl}</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-4 self-baseline">
                        {group2.map((item: any, index: number) => {
                            return <CharacterItem key={'item-' + index} reverse item={item} token={token}/>
                        })}
                    </div>
                </div>
                <div className="flex flex-1 gap-4">
                    {group3.map((item: any, index: number) => {
                        return <CharacterItem key={'item-' + index} reverse={index === 0} bottom item={item}
                                              token={token}/>
                    })}
                </div>
            </div>
        </div>
    )
}
