'use client'
import {Skeleton} from "@nextui-org/react";
import {useQuery} from "@tanstack/react-query";

export default function GearScore({character}: { character: string }) {
    const {data, isLoading} = useQuery({
        queryKey: ['gearScore', character],
        queryFn: async () => {
            const response = await fetch(`/api/v1/services/member/character/${character}/gs`)
            return response.json()
        },
        enabled: !!character,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
    })

    return (
        <div className="flex gap-1 items-center">
            <p className="text-sm text-muted">Gear score: </p>
            <Skeleton isLoaded={!isLoading} className="rounded bg-wood h-6 w-8">
                <span className={`text-${data?.color ?? 'common'} font-bold text-sm text-muted`}>{data?.gs ?? 0}</span>
            </Skeleton>
        </div>
    )
}
