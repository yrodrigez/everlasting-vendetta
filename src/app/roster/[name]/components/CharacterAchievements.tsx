'use client'
import {Achievement} from "@/app/types/Achievements";
import moment from "moment";
import {Button, ScrollShadow} from "@heroui/react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {createBrowserClient} from "@supabase/ssr"
import {useQuery} from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {Blendy, createBlendy} from 'blendy'
import {createPortal} from "react-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose} from "@fortawesome/free-solid-svg-icons";


function AchievementInfo({achievement, onClose}: { achievement: Achievement, onClose: () => void }) {

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {data: earners, isLoading: loading} = useQuery({
        queryKey: ['achievement', achievement.id],
        queryFn: async () => {
            const {
                data,
                error
            } = await supabase.from('member_achievements').select('member:ev_member(character),*').eq('achievement_id', achievement.id)
                .order('earned_at', {ascending: true}).returns<{
                    member: { character: { name: string, avatar: string, id: number } },
                    earned_at: string
                }[]>()
            if (error || !data) {
                console.error('Error fetching achievement:', error)
                return []
            }
            return data ?? []
        },
        staleTime: 1000 * 60 * 30
    })

    const [bgColor, setBgColor] = useState<string|undefined>(undefined)
    const [borderColor, setBorderColor] = useState<string|undefined>(undefined)

    useEffect(() => {
        // @ts-ignore
        if (!window.ColorThief) return
        const img = new window.Image();
        img.src = achievement.img;
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // @ts-ignore
            const colorThief = new window.ColorThief();
            const color = colorThief.getColor(img) as [number, number, number];
            const palette = colorThief.getPalette(img, 5) as [number, number, number][];
            setBgColor(`rgb(${palette[Math.random() * palette.length | 0].join(',')})`)
            const darkerShade = palette.map((channel: any) => Math.max(channel - 30, 0));
            setBorderColor(`rgba(${darkerShade.join(',')}, 1)`)
        };
    }, [achievement]);

    return (
        <div
            className="flex w-full h-full flex-col lg:flex-row items-center lg:justfy-evenly gap-4 overflow-auto scrollbar-pill py-8"
        >
            <div
                className="w-full h-full rounded-xl p-6 flex items-center justify-center bg-wood-900 border"
                style={(bgColor && borderColor) ? {backgroundColor: bgColor, borderColor: borderColor}: undefined}
            >
                <div
                    className="transform lg:scale-150"
                >
                <AchievementCard achievement={achievement} isAchieved={true}/>
                </div>
            </div>
            <div className="w-full h-full flex flex-col gap-4 items-center justify-center overflow-auto">
                <h2 className="text-gold text-2xl font-bold">Earners</h2>
                <ScrollShadow
                    className="w-full h-full flex flex-col gap-4 overflow-auto scrollbar-pill max-h-[600px] p-2">
                    {loading && <span className="text-stone-100 text-lg">Loading...</span>}
                    {!loading && earners?.length === 0 &&
                        <span className="text-stone-100 text-lg">No earners yet</span>}
                    {!loading && earners?.map(({member: {character}, earned_at}) => (
                        <Link key={character.id}
                              href={`/roster/${encodeURIComponent(character.name.toLowerCase())}`}
                              className="w-full h-full max-h-32 flex flex-col gap-4 items-center justify-center border border-wood-100 p-4 hover:border-gold hover:shadow-gold hover:cursor-pointer">
                            <div className="w-full h-full flex flex-col gap-2 items-center justify-center"
                                 onClick={() => onClose()}>
                                <div
                                    className="w-full h-full min-w-48 flex items-center justify-center gap-4">
                                    <img
                                        src={character.avatar}
                                        alt={character.name}
                                        className="w-12 h-12 min-w-12 rounded-full"
                                    />
                                    <span className="text-gold text-lg font-bold w-full">{character.name}</span>
                                </div>
                                <span
                                    className="text-stone-100 text-sm w-full">On: {moment(earned_at).format('YY-MM-DD')}</span>
                            </div>
                        </Link>
                    ))}
                </ScrollShadow>
            </div>
        </div>
    )
}


function AchievementWithAlert({achievement, isAchieved}: { achievement: Achievement, isAchieved: boolean }) {
    const blendy = useRef<Blendy | null>(null)
    const [isClicked, setIsClicked] = useState(false)
    const achievementToggleKey = `achievement-${achievement.id}`
    useEffect(() => {
        blendy.current = createBlendy({animation: 'spring'})
    }, [achievement])
    const handleOnClick = useCallback(() => {
        setIsClicked(true)
        blendy.current?.toggle(achievementToggleKey)
    }, [isAchieved, achievement])

    const handleOnClose = useCallback(() => {
        blendy.current?.untoggle(achievementToggleKey, () => {
            setIsClicked(false)
        })
    }, [isAchieved, achievement])

    return <>
        {isClicked && createPortal((
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center" onClick={handleOnClose}>
                    <div data-blendy-to={achievementToggleKey}
                         onClick={(e) => e.stopPropagation()}
                         className={`w-[900px] h-[750px] flex items-center justify-center p-8 border border-wood-100 bg-wood rounded-xl relative transition-all duration-300`}>
                        <div
                            className={`w-full h-full flex items-center justify-center gap-4 opacity-0 ${isClicked ? 'opacity-100' : ''} transition-all duration-300`}
                        >
                            <AchievementInfo achievement={achievement} onClose={handleOnClose}/>
                        </div>
                        <Button isIconOnly onPress={handleOnClose} className="absolute top-1 right-1 rounded-full" variant="light">
                            <FontAwesomeIcon icon={faClose} className="text-default"/>
                        </Button>
                    </div>
                </div>
            ),
            document.body
        )}
        <AchievementCard achievement={achievement} isAchieved={isAchieved} handleOnClick={handleOnClick}/>
    </>
}

export function AchievementCard({achievement, isAchieved, handleOnClick}: {
    achievement: Achievement,
    isAchieved: boolean,
    handleOnClick?: () => void
}) {

    return (
        <div
            onClick={handleOnClick}
            data-blendy-from={`achievement-${achievement.id}`}
            className={`bg-wood border border-wood-100 p-4 min-w-48 min-h-64 max-w-48 max-h-64 rounded-xl ${isAchieved ? 'shadow shadow-gold border-gold' : ''} flex flex-col items-center justify-center relative mt-6 ${handleOnClick ? 'cursor-pointer' : ''}`}>
            <img
                src={achievement.img}
                alt={achievement.name}
                width={128}
                height={128}
                className={`w-20 h-20 ${['bcc5e55a-e050-4194-8bcc-4b3d51314410', '2de9686a-ca4e-4fd8-8346-fb4b6dd7489f'].indexOf(achievement.id || '') !== -1 ? 'rounded-full' : ''} ${isAchieved ? '' : 'grayscale'} absolute -top-8 left-18`}
            />
            <div className="w-full mt-10">
                <span className="text-gold font-bold text-lg ">{achievement.name}</span>
            </div>
            <div className="w-full h-full overflow-auto scrollbar-pill">
                <span className="text-stone-100 text-sm">{achievement.description}</span>
            </div>
            <div>
                <span className="text-stone-100 text-xs">{achievement.points} points</span>
            </div>
            {isAchieved && !!achievement?.earned_at && (
                <div>
					<span
                        className="text-stone-100 text-xs">On: {moment(achievement.earned_at).format('YY-MM-DD')}</span>
                </div>
            )}
        </div>
    )
}

export default function ({achieved, notAchieved, achievedPoints}: {
    achieved?: Achievement[],
    notAchieved?: Achievement[],
    achievedPoints?: number
}) {
    const userAchievements = useMemo(() => {
        if (!achieved || !notAchieved) return []
        const group = Object.groupBy([...achieved, ...notAchieved], ({category}) => category)
        return (Object.entries(group).map(([category, achievements]) => ({
            category, achievements: achievements?.sort((a: Achievement, b: Achievement) => {
                if (a.earned_at === undefined) return 1
                if (b.earned_at === undefined) return -1
                return new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()
            })
        })) ?? []).sort((a, b) => {
            return a.category.localeCompare(b.category)
        }) as {
            category: string,
            achievements: Achievement[]
        }[]
    }, [achieved, notAchieved])

    return (
        <div
            className="p-4 w-full h-full overflow-auto scrollbar-pill">
            {userAchievements?.map(({category, achievements}: { achievements: Achievement[], category: string }) => (
                <div key={category} className="flex flex-col gap-4 items-start justify-start mb-4">
                    <h2 className="text-gold text-2xl font-bold">Category: <span
                        className="capitalize">{category}</span></h2>
                    <ScrollShadow orientation="horizontal"
                                  className="flex overflow-auto w-full scrollbar-pill gap-4 items-center justify-start p-8 lg:flex-wrap">
                        {achievements.map((achievement: Achievement) => {
                            const isAchieved = achievement.earned_at !== undefined
                            return (
                                <AchievementWithAlert key={achievement.id} achievement={achievement}
                                                      isAchieved={isAchieved}/>
                            )
                        })}
                    </ScrollShadow>
                </div>
            ))}
        </div>
    )
}
