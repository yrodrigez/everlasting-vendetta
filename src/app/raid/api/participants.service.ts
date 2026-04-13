import { SupabaseClient } from "@supabase/supabase-js";
import { MemberRolesRepository } from "./member-roles.repository";
import { fetchResetParticipants } from "./fetchParticipants";

export class ParticipantsService {
    private readonly supabase: SupabaseClient;
    private readonly memberRolesRepository: MemberRolesRepository;

    constructor(supabase: SupabaseClient, memberRolesRepository: MemberRolesRepository) {
        this.supabase = supabase;
        this.memberRolesRepository = memberRolesRepository;
    }

    async fetchParticipantsWithRoles(resetId: string) {
        const participants = await fetchResetParticipants(this.supabase, resetId);
        const memberIds = participants.map(p => p.member.id);
        const roles = await this.memberRolesRepository.getRoles(memberIds);
        return participants.map(participant => ({
            ...participant,
            roles: roles[participant.member.id] || []
        }));
    }
}