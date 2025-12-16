import { apiService } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useUserCharacters(realmSlug: string | null) {

    const { data: userCharacters, isLoading, error } = useQuery({
        queryKey: ['userCharacters', realmSlug],
        queryFn: () => apiService.auth.getUserCharacters(realmSlug ?? ''),
        enabled: !!realmSlug,
    });


    return { userCharacters, isLoading, error };
}