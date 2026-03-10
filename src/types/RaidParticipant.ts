import {Day} from "@/app/calendar/new/Components/useCreateRaidStore";

export type RaidParticipantStatus = 'late' | 'tentative' | 'confirmed' | 'declined' | undefined

export type RaidParticipant = {
    member_id: string;
    raid_id: string;
    created_at: string;
    updated_at: string;
    is_confirmed: boolean;
    details?: {
        days: Day[];
        role: string;
        status: RaidParticipantStatus;
        className: string;
    }
}
