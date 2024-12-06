import {Day} from "@/app/calendar/new/Components/useCreateRaidStore";

export type RaidParticipant = {
    member: {
        id: number;
        character: {
            id: number;
            name: string;
            avatar: string;
            playable_class?: string;
        }
        registration_source?: string;
    },
    is_confirmed: boolean;
    details: {
        days: Day[];
        role: string;
        status: 'confirmed' | 'declined' | 'tentative' | 'late' | 'unknown';
        className: string;
    };
    raid_id: string;
    created_at: string;
}
