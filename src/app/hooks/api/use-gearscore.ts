import { createAPIService } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export interface GearScoreInput {
    characterNames: { name: string, realm: string }[];
}

export function useGearScore({ name, realm }: { name: string, realm: string }) {

    const [forceFetch, setForceFetch] = useState(false);

    const apiService = createAPIService();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['gearScore', name, realm],
        enabled: !!name && !!realm && (!forceFetch || forceFetch), // always true, but allows refetch with force
        queryFn: async () => {
            const { data } = await apiService.anon.gearScore([{ name, realm }], forceFetch);
            return data?.[0];
        },
        staleTime: forceFetch ? 0 : 1000 * 60 * 5, // 5 minutes
        retry: 3,
    });

    return {
        gearScore: data,
        fetchGearScore: () => {
            setForceFetch(true); // trigger refetch with force
            refetch();
        },
        isError,
        isLoading,
    };
}