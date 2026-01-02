import { createAPIService } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useAllowedRealms() {
    const apiService = createAPIService();
    const { data: allowedRealms = [], isLoading, error } = useQuery({
        queryKey: ['allowedRealms'],
        queryFn: () => apiService.realms.getAllowed(),
    });
    return { allowedRealms, isLoading, error };
}