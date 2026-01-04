import CharacterAvatar from "@/app/components/CharacterAvatar";
import { Tooltip } from "@/app/components/tooltip";
import { CharacterGear } from "@/app/roster/[name]/components/CharacterGear";
import { CharacterTalents } from "@/app/roster/[name]/components/CharacterTalents";
import { CharacterViewOptions } from "@/app/roster/[name]/components/CharacterViewOptions";
import GearScore from "@/app/roster/[name]/components/GearScore";
import { LootHistory } from "@/app/roster/[name]/components/LootHistory";
import { StatisticsView } from "@/app/roster/[name]/components/StatisticsView";
import WoWService from "@/app/services/wow-service";
import { GUILD_ID, GUILD_NAME } from "@/app/util/constants";
import moment from "moment";
import Link from "next/link";

import { Button } from "@/app/components/Button";
import { createAPIService, createServerApiClient } from "@/app/lib/api";
import { AttendanceHeatmap } from "@/app/roster/[name]/components/AttendanceHeatmap";
import CharacterAchievements from "@/app/roster/[name]/components/CharacterAchievements";
import CharacterProfessions from "@/app/roster/[name]/components/CharacterProfessions";
import { fetchCharacterProfessionsSpells } from "@/app/roster/[name]/components/professions-api";
import { Achievement, MemberAchievement } from "@/app/types/Achievements";
import { faBan, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SupabaseClient } from "@supabase/supabase-js";
import createServerSession from "@utils/supabase/createServerSession";
import { Metadata } from "next";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic'

const getPlayerClassById = (classId: number | string) => {
    const classes = {
        0: { name: 'Warrior', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warrior.jpg' },
        1: { name: 'Warrior', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warrior.jpg' },
        2: { name: 'Paladin', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_paladin.jpg' },
        3: { name: 'Hunter', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_hunter.jpg' },
        4: { name: 'Rogue', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_rogue.jpg' },
        5: { name: 'Priest', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_priest.jpg' },
        7: { name: 'Shaman', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_shaman.jpg' },
        8: { name: 'Mage', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_mage.jpg' },
        9: { name: 'Warlock', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_warlock.jpg' },
        11: { name: 'Druid', icon: 'https://render.worldofwarcraft.com/classic1x-eu/icons/56/classicon_druid.jpg' },
    } as any

    if (typeof classId === 'string') {
        return Object.values(classes).find((c: any) => c.name.toLowerCase() === classId.toLowerCase()) || {
            name: 'Unknown',
            icon: 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'
        }
    }

    return classes[classId] || {
        name: 'Unknown',
        icon: 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_questionmark.jpg'
    }
}

const findItemBySlotType = (equipment: any = [], slotType: string) => {
    return equipment.find((item: any) => item.slot.type === slotType) || {
        slot: { type: slotType },
        item: { id: 999999 },
        quality: { type: 'POOR', name: 'poor' },
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


interface LootItem {
    characterName: string
    id: number
    date: string
    resetId: string
}

interface LootGroup {
    resetId: string
    date: string
    items: LootItem[]
    reset?: RaidResetData | null
}

interface RaidResetData {
    name: string
    raid: {
        name: string
    }
}

async function fetchLootHistory(supabase: SupabaseClient, characterName: string) {

    const { data, error } = await supabase
        .from('ev_loot_history')
        .select('*')
        .ilike('character', characterName)

    if (error) {
        console.error('Error fetching loot history:', error)
        return {}
    }

    const lootItems: LootItem[] = (data ?? []).map((item: any) => ({
        characterName: item.character ?? '',
        id: parseInt(item.itemID, 10),
        date: item.dateTime ?? '',
        resetId: item.raid_id ?? '',
    }))

    lootItems.sort((a, b) => moment(b.date).diff(moment(a.date)))

    const lootGroups = new Map<string, LootGroup>()
    lootItems.forEach(item => {
        if (!lootGroups.has(item.resetId)) {
            lootGroups.set(item.resetId, {
                resetId: item.resetId,
                date: item.date,
                items: [],
            })
        }
        lootGroups.get(item.resetId)!.items.push(item)
    })

    await Promise.all(
        [...lootGroups.values()].map(async (group) => {
            const { data: resetData, error: resetError } = await supabase
                .from('raid_resets')
                .select('name, raid:ev_raid(name)')
                .eq('id', group.resetId)
                .single()

            if (resetError) {
                console.error(`Error fetching raid reset for resetId ${group.resetId}:`, resetError)
                group.reset = null
            } else {
                // @ts-ignore
                group.reset = resetData
            }
        })
    )

    return Object.fromEntries(lootGroups.entries())
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
    // Fetch or compute character information here
    const { name: characterNameParam } = await params
    const [name, ...realmSlugParts] = characterNameParam.split('-')
    const realmSlug = realmSlugParts.join('-') || 'living-flame';
    const characterName = decodeURIComponent(name.toLowerCase())

    const characterInfo = await createAPIService().anon.getCharacter(realmSlug, characterName);

    return {
        title: `${characterInfo.name} - ${characterInfo.guild?.name ?? 'No Guild'} | Everlasting Vendetta`,
        description: `${characterInfo.name} is a level ${characterInfo.level} ${characterInfo.character_class?.name}. ${characterInfo.guild?.name ? `A proud member of ${characterInfo.guild.name}` : 'Not part of any guild.'
            } View gear, talents, and loot history.`,
        keywords: 'wow, world of warcraft, guild recruitment, raiding, pve, pvp, classic, tbc, burning crusade, shadowlands, lone wolf, everlasting vendetta, guild events, guild forum, season of discovery, sod',
    };
}


const onSubmit = async ({
    characterId,
    isCharacterBanned,
    canBan,
    canUnban,
    characterName,
}: {
    characterId: number,
    isCharacterBanned: boolean,
    canBan: boolean,
    canUnban: boolean,
    characterName: string,

}) => {
    'use server';
    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    if (canBan && !isCharacterBanned) {
        const { error } = await supabase
            .from('banned_member')
            .insert({ member_id: characterId })
        if (error) {
            console.error(error)
        } else {
            console.log('Character banned', characterName, characterId)
        }
    } else if (canUnban && isCharacterBanned) {
        const { error } = await supabase
            .from('banned_member')
            .delete({
                count: 'exact'
            })
            .eq('member_id', characterId)
        if (error) {
            console.error(error)
        } else {
            console.log('Character unbanned', characterName, characterId)
        }
    }
    revalidatePath(`/roster/${characterName}`)
}

const fetchAchievements = async (supabase: SupabaseClient, characterId: number) => {

    const { data: achievements } = await supabase.from('achievements').select('*').returns<Achievement[]>()
    const { data } = await supabase.from('member_achievements').select('*').eq('member_id', characterId).returns<MemberAchievement[]>()

    const achieved = achievements?.filter((ach) => data?.find((a) => a.achievement_id === ach.id)).map((ach) => ({
        ...ach,
        earned_at: data?.find((a) => a.achievement_id === ach.id)?.earned_at ?? null
    }))
    const notAchieved = achievements?.filter((ach) => !data?.find((a) => a.achievement_id === ach.id))

    return {
        achieved,
        notAchieved,
        achievedPoints: achieved?.reduce((acc, ach) => acc + ach.points, 0) ?? 0,
    } as { achieved: Achievement[] & { earned_at?: string }, notAchieved: Achievement[], achievedPoints: number }
}


export default async function Page({ params }: { params: Promise<{ name: string }> }) {

    const { name: characterNameParam } = await params
    const [name, ...realmSlugParts] = characterNameParam.split('-')
    const realmSlug = realmSlugParts.join('-') || 'living-flame';
    
    const { accessToken } = await createServerSession();
    const api = createServerApiClient(accessToken || null);
    const apiService = createAPIService(api);

    const allowedRealms = await apiService.realms.getAllowed()
    if (!allowedRealms.find(r => r.slug === realmSlug)) {
        return <div>Realm not allowed</div>
    }

    const characterName = decodeURIComponent(name.toLowerCase()).trim()

    const { auth, getSupabase } = await createServerSession();

    const {
        fetchEquipment,
        getCharacterTalents,
        fetchCharacterStatistics
    } = new WoWService()
    const characterInfo = await (async () => {
        try {
            return await apiService.anon.getCharacter(realmSlug, characterName)
        } catch (e) {
            console.error('Error fetching character info:', e)
            return null
        }
    })();

    if (!characterInfo) {
        return <div>Character not found</div>
    }

    const supabase = await getSupabase();
    const [equipment, talents, characterStatistics, lootHistory, { data: isCharacterBanned }, { data: isMemberPresent }, achievementData, attendance, professions] = await Promise.all([
        
        fetchEquipment(characterName, realmSlug),
        getCharacterTalents(characterName, realmSlug),
        fetchCharacterStatistics(characterName, realmSlug),
        fetchLootHistory(supabase, characterName),
        supabase
            .from('banned_member')
            .select('id')
            .eq('member_id', characterInfo.id)
            .limit(1)
            .maybeSingle(),
        supabase.from('ev_member').select('id').eq('id', characterInfo.id).maybeSingle(),
        fetchAchievements(supabase, characterInfo.id),
        supabase.rpc('raid_attendance', { character_name: characterName }).returns<{
            id: string,
            raid_name: string,
            raid_date: string,
            participated: boolean,
        }[]>(),
        fetchCharacterProfessionsSpells(supabase, characterInfo.id)
    ])

    const equipmentData = equipment.equipped_items
    const group1 = findEquipmentBySlotTypes(equipmentData, ['HEAD', 'NECK', 'SHOULDER', 'BACK', 'CHEST', 'SHIRT', 'TABARD', 'WRIST'])
    const group2 = findEquipmentBySlotTypes(equipmentData, ['HANDS', 'WAIST', 'LEGS', 'FEET', 'FINGER_1', 'FINGER_2', 'TRINKET_1', 'TRINKET_2'])
    const group3 = findEquipmentBySlotTypes(equipmentData, ['MAIN_HAND', 'OFF_HAND', 'RANGED'])

    if (!characterInfo) {
        return <div>Character not found</div>
    }

    const session = await auth.getSession()
    const isGuildMember = session?.isGuildMember || false
    const canBan = !!(session?.permissions.includes('member.ban') && characterInfo.guild?.id !== GUILD_ID && isMemberPresent && !isCharacterBanned) // can ban only if not in the same guild
    const canUnban = !!(session?.permissions.includes('member.unban') && characterInfo.guild?.id !== GUILD_ID && isCharacterBanned) // can unban only if not in the same guild

    return (
        <>
            <div className="relative w-full h-full flex flex-col">
                <div className="mx-auto max-w-6xl px-4 flex justify-evenly items-center h-36">
                    <div className="flex items-center gap-4 mb-4 ">
                        <div className="w-20 h-20 rounded-full overflow-hidden min-w-20">
                            <CharacterAvatar realm={realmSlug} characterName={characterInfo.name}
                                className={`rounded-full border-3  border-${characterInfo?.character_class?.name?.toLowerCase()}`} />
                        </div>
                        <div className="grid gap-1.5 w-full">
                            <h2 className="font-semibold text-lg w-full flex items-center justify-between">{characterInfo?.name}
                                <span
                                    className="text-lg text-gold font-normal hidden lg:block ml-10"> ({achievementData.achievedPoints} Points)</span>
                            </h2>
                            {characterInfo?.guild?.name ? (
                                <Link
                                    href={characterInfo?.guild?.name === GUILD_NAME ? '/roster' : `/guild/${characterInfo?.realm?.id}-${characterInfo?.guild?.id}`}
                                    className="text-sm text-gold">{`<${characterInfo?.guild?.name}>`}</Link>
                            ) : null}
                            <p className="text-sm text-muted">
                                Level {characterInfo?.level} <span
                                    className={`text-${characterInfo?.character_class?.name?.toLowerCase()} font-bold`}>{characterInfo?.character_class?.name}</span>
                            </p>
                            <p className="text-sm text-muted">Last online: <span className={`font-bold relative`}>
                                {isGuildMember ? moment(characterInfo?.last_login_timestamp).format('MMMM D HH:MM') : 'no seas porco'}
                                {!isGuildMember ? <Tooltip
                                    placement="right"
                                    showArrow
                                    content="You need to be a guild member to see this information"
                                >
                                    <span className={
                                        `absolute left-0 right-0 -top-1 -bottom-1 rounded backdrop-filter backdrop-blur backdrop-saturate-150 backdrop-contrast-50 bg-gold blur-sm`} />
                                </Tooltip> : null}
                            </span>
                            </p>
                            <GearScore realm={characterInfo.realm?.slug} character={characterName} isGuildMember={isGuildMember} />
                        </div>
                    </div>
                    <img
                        width={56}
                        height={56}
                        className={'rounded-full'}
                        alt={characterInfo.character_class?.name}
                        src={getPlayerClassById(characterInfo.character_class?.name).icon} />
                </div>
                <div className="lg:h-36 hidden lg:flex lg:flex-col">
                    <StatisticsView statistics={characterStatistics} />
                </div>
                <CharacterViewOptions
                    containerClassName={'w-full mt-4 '}
                    innerContainerClassName={'w-full'}
                    items={[
                        {
                            label: 'Gear', name: 'gear', children: <CharacterGear
                                characterName={characterName}
                                gear={{
                                    group1,
                                    group2,
                                    group3
                                }} />
                        },
                        {
                            label: 'Talents', name: 'talents', children: <CharacterTalents
                                characterInfo={characterInfo}
                                talents={talents}
                            />
                        },
                        {
                            label: 'Achievements',
                            name: 'achievements',
                            children: <CharacterAchievements {...achievementData} />
                        },
                        {
                            label: 'Professions',
                            name: 'professions',
                            children: <CharacterProfessions
                                professions={professions}
                                characterId={characterInfo.id}
                            />
                        },
                        {
                            label: 'Loot History',
                            name: 'loot-history',
                            children: <LootHistory lootHistory={lootHistory} />
                        },
                        {
                            label: 'Raid attendance',
                            name: 'raid-attendance',
                            children: <AttendanceHeatmap attendance={Array.isArray(attendance.data) ? attendance.data : []} />
                        }
                    ]}
                />
                <form
                    className="absolute top-0 right-0"
                    action={async () => {
                        'use server';
                        await onSubmit({
                            characterId: characterInfo.id,
                            isCharacterBanned: !!isCharacterBanned,
                            canBan,
                            canUnban,
                            characterName
                        })
                    }}
                >
                    {(canBan && !isCharacterBanned ? (
                        <Button className="bg-red-500 text-white px-4 py-2 rounded-md boder border-red-600"
                            type="submit"
                            startContent={<FontAwesomeIcon icon={faBan} />}
                        >Ban</Button>
                    ) : (canUnban && isCharacterBanned) ? (
                        <Button className="bg-green-500 text-white px-4 py-2 rounded-md boder border-green-600"
                            type="submit"
                            startContent={<FontAwesomeIcon icon={faUserXmark} />}
                        >Unban</Button>
                    ) : null)}
                </form>
            </div>
        </>
    )
}
