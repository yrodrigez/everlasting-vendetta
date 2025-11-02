'use client'
import { GUILD_REALM_SLUG } from "@/app/util/constants";
import { Skeleton, Tooltip } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";

export default function GearScore({ character, isGuildMember }: { character: string, isGuildMember: boolean }) {
    const { data, isLoading } = useQuery({
        queryKey: ['gearScore', character],
        queryFn: async () => {
            if (!isGuildMember) return { gs: 'Porco!', color: 'common' }
            const response = await fetch(`${process.env.NEXT_PUBLIC_EV_API_URL!}/gearscore`, {
                method: 'POST',
                body: JSON.stringify({ characters: [{ name: character, realm: GUILD_REALM_SLUG }] }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EV_ANON_TOKEN}`
                }
            })
            const { data: [{ score: gs, color, isFullEnchanted }] = [] } = await response.json()
            return { gs, color, isFullEnchanted }
        },
        enabled: !!character,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
    })

    return (
        <div className="flex gap-1 items-center">
            <p className="text-sm text-muted">Gear score: </p>
            <Skeleton isLoaded={!isLoading} className={`rounded bg-transparent h-6 w-12 ${isLoading ? 'bg-wood' : ''}`}>
                <div className={`relative ${!isGuildMember ? 'shadow-gold shadow-lg rounded' : ''} `}>
                    <span
                        className={`text-${data?.color ?? 'common'} font-bold text-sm text-muted`}>{data?.gs ?? 0}</span>
                    {!isGuildMember && <Tooltip
                        content="You need to be a guild member to see this information"
                        showArrow
                        shadow="lg"
                        placement="right"
                    >
                        <div
                            className="absolute left-0 right-0 -top-1 -bottom-1 rounded backdrop-filter backdrop-blur backdrop-contrast-0 bg-gold blur-sm"
                        />
                    </Tooltip>}
                </div>
            </Skeleton>
        </div>
    )
}
