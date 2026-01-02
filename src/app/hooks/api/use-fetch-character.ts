import { useMutation } from "@tanstack/react-query";
import { createAPIService } from "@/app/lib/api";

export interface FetchCharacterInput {
    realm: string;
    name: string;
}

export interface FetchCharacterOutput {
    id: number;
    wow_account_id: string;
    realm: {
        id: number;
        name: string;
        slug: string;
    };
    name: string;
    level: number;
    character_class: {
        id: number;
        name: string;
    };
    playable_class: {
        id: number;
        name: string
    };
    guild?: {
        id: number;
        name: string;
    }
    avatar: string;
    last_login_timestamp: number;
    selectedRole?: string;
    faction: string;
}

export function useFetchCharacter() {
    const apiService = createAPIService();

    const { data, mutate: fetchCharacter, mutateAsync: fetchCharacterAsync, isError, isPending } = useMutation({
        mutationFn: async ({ realm, name }: FetchCharacterInput) => {
            return await apiService.anon.getCharacter(realm, name);
        },
    });

    return {
        character: data,
        fetchCharacter,
        fetchCharacterAsync,
        isError,
        isPending,
    };
}