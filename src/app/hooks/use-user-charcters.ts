import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export function useUserCharacters() {
    const { data, error, isLoading } = useQuery({
        queryKey: ['userCharacters'],
        queryFn: async () => {
            const { data } = await api.get('/auth/characters/linked');
            return data.linkedCharacters.map((char: any) => char.character);
        },
    });

    return { characters: data, error, isLoading };
}

export function useInvalidateUserCharacters() {
    const queryClient = useQueryClient();
    return () => {
        queryClient.invalidateQueries({ queryKey: ['userCharacters'] });
    };
}