import { createAPIService } from "@/app/lib/api";
import { useQuery } from "@tanstack/react-query";
export type Item = {
    icon: string;
    level: number;
    name: string;
    tooltip: string;
    itemLevel: number;
    quality: {
        type: string;
        name: string;
    };
    displayId: number;
}

export type ItemFetchResponse = {
    itemIconUrl: string;
    itemDetails: Item;
    displayId: number | null;
    request_id: string;
}

// /api/wow/item/185986

export function useWoWItem(itemId: number) {

    const apiService = createAPIService();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['wowItem', itemId],
        queryFn: async () => {
            if (!itemId) {
                return null;
            }
            try {
                const response = await apiService.anon.getItem(itemId);
                return response;
            } catch (error) {
                console.error(`Error fetching WoW item with ID ${itemId}:`, error);
                throw error;
            }
        },
        enabled: !!itemId,
    });

    return { data, isLoading, isError };
}