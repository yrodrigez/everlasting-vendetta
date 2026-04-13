import { SupabaseClient } from "@supabase/supabase-js";

export class MemberRolesRepository {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async getRoles(memberIds: number[]): Promise<Record<number, string[]>> {
        const { data, error } = await this.supabase
            .from('ev_member_role')
            .select('member_id, role')
            .in('member_id', memberIds)
            .overrideTypes<{ member_id: number; role: string }[]>();

        if (error) {
            throw new Error(error.message);
        }

        return (data ?? []).reduce((acc, { member_id, role }) => {
            if (!acc[member_id]) {
                acc[member_id] = [];
            }
            acc[member_id].push(role);
            return acc;
        }, {} as Record<number, string[]>);
    }
}