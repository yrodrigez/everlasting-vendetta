"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Spinner, Tooltip } from "@heroui/react";
import { Button } from "@/components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { aiGroupExport } from "@/lib/supa-functions/config";
import { useMessageBox } from '@/util/msgBox';
import { useAuth } from "@/context/AuthContext";
import { useSupabase } from "@/context/SupabaseContext";
import { MemberRolesRepository } from "@/app/raid/api/member-roles.repository";
import { ParticipantsService } from "@/app/raid/api/participants.service";
import { createParticipantsComparator } from "@/app/raid/raid-priority-comparator";
import { createAPIService } from "@/lib/api";

const MAX_PARTICIPANTS = 40;
const MAIN_GROUP_SIZE = 5;
const OVERFLOW_GROUP_NUMBERS = [8, 7, 6];

export default function GroupExport({ resetId, raidSize, createdById }: { resetId: string, raidSize: number, createdById: number }) {
    const { user } = useAuth();
    const supabase = useSupabase();
    const apiService = useMemo(() => createAPIService(), []);
    const [copySuccess, setCopySuccess] = useState("");
    const [generateRoster, setGenerateRoster] = useState("");

    const { data: participants = [] } = useQuery({
        queryKey: ["resetExport", resetId],
        queryFn: async () => {
            if (!supabase) return [];
            const memberRolesRepository = new MemberRolesRepository(supabase);
            const participantsService = new ParticipantsService(supabase, memberRolesRepository);
            const rows = await participantsService.fetchParticipantsWithRoles(resetId);
            return rows.filter((p) => {
                const status = p.details?.status as string | undefined;
                return status !== "declined" && status !== "bench";
            });
        },
        enabled: !!supabase,
    });

    const participantIdsKey = participants.map((p) => p.member.character.id).sort((a, b) => a - b).join(",");

    const { data: participantGearScores = [] } = useQuery({
        queryKey: ["group-export-gear-scores", resetId, participantIdsKey],
        queryFn: async () => {
            const characters = participants
                .map((participant) => {
                    const character = participant.member.character;
                    if (!character?.name || !character.realm?.slug) return null;
                    return { name: character.name, realm: character.realm.slug };
                })
                .filter((c): c is { name: string, realm: string } => !!c);
            if (!characters.length) return [] as { characterName: string, isFullEnchanted: boolean }[];
            const { data = [] } = await apiService.anon.gearScore(characters, false);
            return data.map(({ characterName, isFullEnchanted }) => ({ characterName, isFullEnchanted }));
        },
        enabled: participants.length > 0,
        staleTime: 3600000,
    });

    const { data: participantReliabilityScores = [] } = useQuery({
        queryKey: ["group-export-reliability", resetId, participantIdsKey],
        queryFn: async () => {
            const results = await Promise.all(
                participants.map(async (participant) => {
                    const character = participant.member.character;
                    const { data, error } = await supabase
                        .rpc("get_recent_raid_reliability_rating", {
                            p_character_name: character.name.toLowerCase(),
                            p_realm_slug: character.realm.slug,
                        })
                        .single<{ final_recent_reliability: number | null }>();
                    if (error) {
                        console.error("Error fetching participant reliability", character.name, error);
                        return { characterName: character.name, finalRecentReliability: 0 };
                    }
                    return {
                        characterName: character.name,
                        finalRecentReliability: Number(data?.final_recent_reliability ?? 0),
                    };
                })
            );
            return results;
        },
        enabled: !!supabase && participants.length > 0,
        staleTime: Infinity,
    });

    const fullEnchantByCharacterName = useMemo(() => new Map(
        participantGearScores.map(({ characterName, isFullEnchanted }) => [characterName.toLowerCase(), isFullEnchanted])
    ), [participantGearScores]);

    const reliabilityByCharacterName = useMemo(() => new Map(
        participantReliabilityScores.map(({ characterName, finalRecentReliability }) => [characterName.toLowerCase(), finalRecentReliability])
    ), [participantReliabilityScores]);

    const participantsComparator = useMemo(
        () => createParticipantsComparator(reliabilityByCharacterName, fullEnchantByCharacterName, createdById),
        [reliabilityByCharacterName, fullEnchantByCharacterName, createdById]
    );

    useEffect(() => {
        if (!participants.length) return;

        const sortedParticipants = [...participants].sort(participantsComparator);
        const capped = sortedParticipants.slice(0, MAX_PARTICIPANTS);
        const main = capped.slice(0, raidSize);
        const overflow = capped.slice(raidSize);

        const mainTanks = main.filter((p) => p.details.role.includes("tank"));
        const mainOthers = main.filter((p) => !p.details.role.includes("tank"));

        const mainGroups: string[][] = [];
        let currentGroup: string[] = [];

        mainTanks.forEach((tank, index) => {
            currentGroup.push(tank.member.character.name);
            if (currentGroup.length === MAIN_GROUP_SIZE || (index === mainTanks.length - 1 && currentGroup.length > 0)) {
                mainGroups.push(currentGroup);
                currentGroup = [];
            }
        });

        mainOthers.forEach((participant, index) => {
            currentGroup.push(participant.member.character.name);
            if (currentGroup.length === MAIN_GROUP_SIZE || index === mainOthers.length - 1) {
                mainGroups.push(currentGroup);
                currentGroup = [];
            }
        });

        const overflowChunks: string[][] = [];
        for (let i = 0; i < overflow.length && overflowChunks.length < OVERFLOW_GROUP_NUMBERS.length; i += MAIN_GROUP_SIZE) {
            overflowChunks.push(overflow.slice(i, i + MAIN_GROUP_SIZE).map((p) => p.member.character.name));
        }

        const mainLines = mainGroups
            .slice(0, OVERFLOW_GROUP_NUMBERS[OVERFLOW_GROUP_NUMBERS.length - 1] - 1)
            .map((group, index) => `${index + 1}:${group.join(",")}`);

        const overflowLines = overflowChunks.map(
            (group, index) => `${OVERFLOW_GROUP_NUMBERS[index]}:${group.join(",")}`
        );

        const allTanksWithinCap = capped.filter((p) => p.details.role.includes("tank"));
        const tanksLine = `9:${allTanksWithinCap.map((tank) => tank.member.character.name).join(",")}`;

        setGenerateRoster([...mainLines, ...overflowLines, tanksLine].join("\n"));
    }, [participants, participantsComparator, raidSize]);

    const userHasPermission = useMemo(() => {
        if (!user) return false;
        const { roles } = user;

        return roles?.includes("GUILD_MASTER");
    }, [user])

    const copyToClipboard = useCallback(() => {
        if (!generateRoster) return;
        navigator.clipboard.writeText(generateRoster).then(
            () => setCopySuccess("Copied to clipboard!"),
            () => setCopySuccess("Failed to copy.")
        );
    }, [generateRoster]);
    const { alert } = useMessageBox()

    const { mutate: sortRosterAi, isPending } = useMutation({
        mutationKey: ["sortRosterAi", resetId],
        mutationFn: async () => {
            if (!supabase) {
                return { error: "No supabase client" };
            }

            try {
                const { data } = await axios.get(`${aiGroupExport}?resetId=${resetId}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    }
                })

                if (!data) {
                    return { error: "No data" };
                }
                if (data.error) {
                    alert({
                        title: "Error",
                        message: data.error,
                        type: "error",
                    })
                    return { error: data.error };
                }

                const { composition } = data;
                setGenerateRoster(composition);

            } catch (e: any) {
                alert({
                    title: "Error",
                    message: "Failed to fetch AI group export. Please try again.",
                    type: "error",
                })
                return { error: "Error fetching AI group export" };
            }


        },

    })

    if (!participants?.length) {
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
                    >/gl roster</code> in the chat.
                    </li>
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
            <div className="flex flex-col gap-2 mt-4 float-right">
                <Tooltip
                    content={'Compose with AI'}
                    placement="top"
                >
                    <Button isIconOnly size="lg" onPress={() => sortRosterAi()} isLoading={isPending}
                        isDisabled={!userHasPermission || isPending}>
                        <FontAwesomeIcon icon={faBrain} className="text-gold" />
                    </Button>
                </Tooltip>
            </div>
        </div>
    );
}
