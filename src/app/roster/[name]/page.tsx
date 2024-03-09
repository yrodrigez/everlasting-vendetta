import axios from "axios";
import WoWHeadTooltip from "@/app/components/WoWHeadTooltip";
import CharacterAvatar from "@/app/components/CharacterAvatar";
import CharacterItem from "@/app/components/CharacterItem";

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

export default async function Page({params}: { params: { name: string } }) {
    const {token} = await getBlizzardToken()
    const {data: characterInfo} = await fetchMemberInfo(token, 'lone-wolf', params.name)
    const {data: equipment} = await fetchEquipment(token, 'lone-wolf', params.name)
    const equipmentData = equipment.equipped_items
    const headItem = equipmentData.find((item: any) => item.slot.type === 'HEAD')
    const neckItem = equipmentData.find((item: any) => item.slot.type === 'NECK')
    const shoulderItem = equipmentData.find((item: any) => item.slot.type === 'SHOULDER')
    const backItem = equipmentData.find((item: any) => item.slot.type === 'BACK')
    const chestItem = equipmentData.find((item: any) => item.slot.type === 'CHEST')
    const shirtItem = equipmentData.find((item: any) => item.slot.type === 'SHIRT') || {
        slot: {type: 'SHIRT'},
        item: {id: 999999},
        quality: {type: 'POOR', name: 'poor'},
        level: 0,
        name: 'Shirt'
    }
    const tabardItem = equipmentData.find((item: any) => item.slot.type === 'TABARD') || {
        slot: {type: 'TABARD'},
        item: {id: 999999},
        quality: {type: 'POOR', name: 'poor'},
        level: 0,
        name: 'Tabard'
    }
    const wristItem = equipmentData.find((item: any) => item.slot.type === 'WRIST')
    const group1 = [headItem, neckItem, shoulderItem, backItem, chestItem, shirtItem, tabardItem, wristItem]
    const handsItem = equipmentData.find((item: any) => item.slot.type === 'HANDS')
    const waistItem = equipmentData.find((item: any) => item.slot.type === 'WAIST')
    const legsItem = equipmentData.find((item: any) => item.slot.type === 'LEGS')
    const feetItem = equipmentData.find((item: any) => item.slot.type === 'FEET')
    const finger1Item = equipmentData.find((item: any) => item.slot.type === 'FINGER_1')
    const finger2Item = equipmentData.find((item: any) => item.slot.type === 'FINGER_2')
    const trinket1Item = equipmentData.find((item: any) => item.slot.type === 'TRINKET_1')
    const trinket2Item = equipmentData.find((item: any) => item.slot.type === 'TRINKET_2')
    const group2 = [handsItem, waistItem, legsItem, feetItem, finger1Item, finger2Item, trinket1Item, trinket2Item]
    const mainHandItem = equipmentData.find((item: any) => item.slot.type === 'MAIN_HAND')
    const offHandItem = equipmentData.find((item: any) => item.slot.type === 'OFF_HAND')
    const rangedItem = equipmentData.find((item: any) => item.slot.type === 'RANGED')
    const group3 = [mainHandItem, offHandItem, rangedItem]

    return (
        <div>
            <div className="mx-auto max-w-6xl px-4 flex justify-evenly items-center">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden">
                        <CharacterAvatar token={token} realm={'lone-wolf'} characterName={characterInfo.name}
                                         className="rounded-full border-3 border-epic"/>
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
                        {group1.map((item: any, index) => {
                            return <CharacterItem key={'item-' + index} item={item} token={token}/>
                        })}
                    </div>
                    <div className="flex flex-1 flex-col gap-4 self-baseline">
                        {group2.map((item: any, index: number) => {
                            return <CharacterItem key={'item-' + index} reverse item={item} token={token}/>
                        })}
                    </div>
                </div>
                <div className="flex flex-1 gap-4">
                    {group3.map((item: any, index: number) => {
                        return <CharacterItem key={'item-' + index} reverse={index === 0} item={item} token={token}/>
                    })}
                </div>
            </div>
        </div>
    )
}
