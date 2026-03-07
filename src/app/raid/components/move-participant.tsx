'use client'
import { Button } from "@/app/components/Button";
import { useAuth } from "@/app/context/AuthContext";
import { useMessageBox } from "@/app/util/msgBox";
import { createClientComponentClient } from "@/app/util/supabase/createClientComponentClient";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { ArrowRightLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Tooltip } from "@/app/components/tooltip";

export const MoveParticipant = ({
    memberId,
    raidId: _,
    resetId,
    onSuccess,
    currentResets,
}: {
    memberId: string;
    raidId: string;
    resetId: string | null;
    onSuccess: () => void;
    currentResets?: { id: string, raid_date: string }[];
}) => {
    const { yesNo, alert } = useMessageBox();
    const { accessToken } = useAuth()
    const supabase = useMemo(() => createClientComponentClient(accessToken), [accessToken]);

    const handleMove = async (newResetId: string) => {
        const confirmed = await yesNo({
            title: 'Move Participant',
            message: 'Are you sure you want to move this participant to the new raid session? This action cannot be undone.',
            yesText: 'Yes, Move',
            noText: 'No',
        });
        if (confirmed !== 'yes') return;
        try {
            const [participation, reservation] = await Promise.all([
                supabase.from('ev_raid_participant').update({ raid_id: newResetId }).eq('member_id', memberId).eq('raid_id', resetId), // This is correct, the participation table uses raid_id to link to the raid session, while the reservation table uses reset_id
                supabase.from('raid_loot_reservation').update({ reset_id: newResetId }).eq('member_id', memberId).eq('reset_id', resetId)
            ]);
            const { error: participationError } = participation;
            const { error: reservationError } = reservation;
            if (participationError || reservationError) {
                console.error('Error moving participant', participationError || reservationError);
                alert({ message: 'An error occurred while moving the participant.', type: 'error' });
                return;
            }
            alert({ message: 'Participant moved successfully!', type: 'success' });
            onSuccess();
        } catch (error) {
            alert({ message: 'An error occurred while moving the participant.', type: 'error' });
        }
    }

    const [availableResets, setAvailableResets] = useState(currentResets);
    useEffect(() => {
        if (!currentResets) return;
        const fetchAvailableResets = async () => {
            try {
                const currentResetIds = currentResets.map(r => r.id);
                const { data, error } = await supabase.from('ev_raid_participant')
                    .select('raid_id, reset:raid_resets(raid_date)')
                    .eq('member_id', memberId)
                    .in('raid_id', currentResetIds);
                if (error) {
                    console.error('Error checking participant availability for other resets', error);
                    setAvailableResets([]);
                    return;
                }
                const participantResetIds = data.map(participation => participation.raid_id);
                setAvailableResets(currentResets.filter(reset => (!participantResetIds.includes(reset.id))));
            } catch (error) {
                console.error('Error fetching participant availability for other resets', error);
                setAvailableResets([]);
            }
        }
        fetchAvailableResets();
    }, [currentResets, resetId, memberId, supabase]);

    return (
        (availableResets?.length ?? 0) > 0 && (
            <div className="flex items-center gap-2 grow p-2 border border-wood-100 rounded-lg justify-between w-full">
                <span className="text-default">Move participant</span>
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly size="sm"><ArrowRightLeft /></Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        onAction={(key) => {
                            if (key === 'disabled') return;
                            handleMove(key as string);
                        }}>
                        {availableResets?.map(reset => (
                            <DropdownItem key={reset.id} value={reset.id}>
                                {moment(reset.raid_date).format('dddd, MMMM D')}
                            </DropdownItem>
                        )) ?? <DropdownItem key={'disabled'} value={'disabled'}>No other raid sessions available</DropdownItem>}
                    </DropdownMenu>
                </Dropdown>
            </div>
        ) || (
            <Tooltip
                className="w-48 border border-wood-100"
                content="No other raid sessions available to move this participant to. They are already participating in all of them or there are no other raid sessions in the future."
                placement="top"
                showArrow
            >
                <div className="flex items-center gap-2 grow p-2 border border-wood-100 rounded-lg justify-between w-full opacity-50 cursor-not-allowed">
                    <span className="text-default">Move participant</span>
                    <Button isIconOnly size="sm" disabled><ArrowRightLeft /></Button>
                </div>
            </Tooltip>
        )
    )
}