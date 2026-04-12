import { createAPIService } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useCharacter(realm: string, characterName: string) {
    const apiService = createAPIService();
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ['character', realm, characterName],
        queryFn: () => apiService.anon.getCharacter(realm, characterName),
        enabled: !!realm && !!characterName,
        staleTime: Infinity,
    });

    return {
        character: data,
        isLoading,
        error,
        refetch,
    };
}
