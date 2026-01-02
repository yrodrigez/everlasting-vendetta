import { createAPIService } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useCharacterAvatar(realm: string, characterName: string) {
    const apiService = createAPIService();
    const { data, error, isLoading } = useQuery({
        queryKey: ['character-avatar', realm, characterName],
        queryFn: () => apiService.anon.getCharacterAvatar(realm, characterName),
        enabled: !!realm && !!characterName,
        staleTime: Infinity,
    })

    return {
        avatar: data,
        isLoading,
        error,
    };
}