"use client";
import {useSession} from "@hooks/useSession";
import {useQuery} from "@tanstack/react-query";
import {type Role} from "@/app/components/characterStore";
import {useState, useMemo, useCallback} from "react";
import {Spinner} from "@nextui-org/react";

export default function GroupExport({resetId}: { resetId: string }) {
    const {supabase} = useSession();
    const [copySuccess, setCopySuccess] = useState("");

    const {data: participants, isLoading, isError} = useQuery({
        queryKey: ["resetExport", resetId],
        queryFn: async () => {
            if (!supabase) {
                return [];
            }

            const {data, error} = await supabase
                .from("ev_raid_participant")
                .select("member:ev_member(character), details, updated_at, created_at")
                .eq("raid_id", resetId)
                .neq("details->>status", "declined")
                .neq("details->>status", "bench")
                .order("created_at", {ascending: false})
                .order("updated_at", {ascending: false})
                .returns<{
                    member: {
                        character: {
                            name: string;
                        };
                    };
                    details: {
                        role: Role;
                        status: string;
                    };
                    updated_at: string;
                }[]>();

            if (error) {
                throw new Error("Error fetching reset");
            }


            return data;
        },
        enabled: !!supabase,
    });

    const generateRoster = useMemo(() => {
        if (!participants?.length) return "";

        const sortedParticipants = participants.sort((a, b) => {
            const rolePriority = {
                tank: 1,
                "tank-healer": 2,
                "tank-dps": 2,
                healer: 3,
                dps: 4,
                "healer-dps": 5,
            };

            return rolePriority[a.details.role] - rolePriority[b.details.role];
        });

        const tanks = sortedParticipants.filter((p) => p.details.role.includes("tank"));
        const others = sortedParticipants.filter((p) => !p.details.role.includes("tank"));

        const groups = [] as string[][];
        let currentGroup = [] as string[];


        tanks.forEach((tank, index) => {
            currentGroup.push(tank.member.character.name);
            if (currentGroup.length === 5 || (index === tanks.length - 1 && currentGroup.length > 0)) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        });


        others.forEach((participant, index) => {
            currentGroup.push(participant.member.character.name);
            if (currentGroup.length === 5 || index === others.length - 1) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        });

        const formattedTanksGroup = `9:${tanks.map((tank) => tank.member.character.name).join(",")}`;

        const formattedGroups = groups
            .map((group, index) => `${index + 1}:${group.join(",")}`)
            .join("\n");

        return `${formattedGroups}\n${formattedTanksGroup}`;
    }, [participants]);

    const copyToClipboard = useCallback(() => {
        if (!generateRoster) return;
        navigator.clipboard.writeText(generateRoster).then(
            () => setCopySuccess("Copied to clipboard!"),
            () => setCopySuccess("Failed to copy.")
        );
    }, [generateRoster]);

    if(!participants?.length) {
        return <div className="p-4">No participants found for this reset.</div>
    }

    return (
        <div className="p-4">
            <div className="mb-4 text-sm">
                <p>
                    Use the following steps in Gargul to apply the roster:
                </p>
                <ol
                    className={'list-decimal list-inside text-sm'}>
                    <li>Open Gargul by typing <code
                        className={'bg-dark p-1 rounded-md text-gold border border-dark-100'}
                    >/gl roster</code> in the chat.</li>
                    <li>Copy the generated roster below and paste it into the Gargul roster window.</li>
                    <li>Click <strong>Apply</strong> to sort the groups automatically.</li>
                    <li>Ensure all raid members are present and out of combat before inviting.</li>
                    <li>For tanks, use the <strong>Assign Tanks</strong> button in Gargul after applying the roster.
                    </li>
                </ol>
            </div>
            {participants ? (
                <>
          <textarea
              readOnly
              value={generateRoster}
              rows={10}
              onClick={() => copyToClipboard()}
              className="w-full p-2 mb-4 border rounded-md resize-none focus:ring-2 focus:ring-gold bg-wood overflow-hidden text-sm"
          ></textarea>
                    {copySuccess && <div className="mt-1 text-sm text-green-600">{copySuccess}</div>}
                </>
            ) : (
                <div
                    className="w-full h-full flex items-center justify-center"
                >
                    <Spinner
                        color="success"
                        size="lg"
                    />
                </div>
            )}
        </div>
    );
}
