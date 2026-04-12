import { createAPIService } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useDiscordSelectedCharacter(discordId: string) {
    const apiService = createAPIService();
    const { data, error, isLoading } = useQuery({
        queryKey: ['discord-selected-character', discordId],
        queryFn: () => apiService.discord.getSelectedCharacter(discordId),
        enabled: !!discordId,
        staleTime: Infinity,
    });

    return {
        character: data?.character,
        isLoading,
        error,
    };
}
