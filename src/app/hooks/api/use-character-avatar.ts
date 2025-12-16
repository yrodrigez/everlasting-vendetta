import { apiService as api } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useCharacterAvatar(realm: string, characterName: string) {
    const { data, error, isLoading } = useQuery({
        queryKey: ['character-avatar', realm, characterName],
        queryFn: () => api.anon.getCharacterAvatar(realm, characterName),
        enabled: !!realm && !!characterName,
        staleTime: Infinity,
    })

    return {
        avatar: data,
        isLoading,
        error,
    };
}