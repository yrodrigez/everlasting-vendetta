'use client'
import { getQualityColor } from "@/util";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ScrollShadow, useDisclosure } from "@heroui/react";
import { Button } from "@/components/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMessageBox } from '@/util/msgBox';
import { useAuth } from "@/context/AuthContext";
import { useSupabase, safeChannel } from "@/context/SupabaseContext";
import { useRouter } from "next/navigation";
import { useRaidItems } from "./raid-items-context";
import moment from "moment";

export function BannedItems({ reset_id, isAdmin = false, raid_id, realmSlug, reset_date }: {
    reset_id: string,
    isAdmin?: boolean,
    raid_id: string,
    realmSlug: string,
    reset_date: string
}) {
    const { repository } = useRaidItems()
    const { isAuthenticated, user } = useAuth()
    const supabase = useSupabase()
    const domain = realmSlug === 'living-flame' ? 'classic' : 'tbc'

    const [updateLoading, setUpdateLoading] = useState(false)
    const { alert, yesNo } = useMessageBox()

    const { data: hardReservations = [], refetch } = useQuery({
        queryKey: ['hard-reserve-rules', reset_id],
        queryFn: () => repository.fetchHardReserveRules(reset_id),
        enabled: !!reset_id,
        staleTime: 60000,
    })

    const refetchRef = useRef<(() => void) | null>(null)
    refetchRef.current = refetch

    // Realtime subscription for rule changes
    const [realtimeError, setRealtimeError] = useState(false)
    useEffect(() => {
        if (!supabase || !reset_id || !isAuthenticated) return

        const channel = safeChannel(supabase, `hard_reserve_rules:${reset_id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'raid_loot_item_rules',
            }, () => {
                refetchRef.current?.()
            })
            .subscribe((status, err) => {
                if (err) {
                    console.error('Error subscribing to raid_loot_item_rules for banned items:', err)
                    setRealtimeError(true)
                } else if (status === 'SUBSCRIBED') {
                    setRealtimeError(false)
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, reset_id, isAuthenticated])

    // Fallback polling if realtime fails
    useQuery({
        queryKey: ['hard-reserve-rules-poll', reset_id],
        queryFn: () => repository.fetchHardReserveRules(reset_id),
        enabled: realtimeError && !!reset_id,
        refetchInterval: 60000,
    })

    const updateFutureRaids = useCallback(async () => {
        if (!supabase || !reset_id || !raid_id || !user) return
        if (updateLoading) return
        setUpdateLoading(true)
        const accept = await yesNo({
            message: 'Are you sure you want to update future raids? This will clone all current rules to future raids.',
            yesText: 'Yes, update future raids',
            noText: 'No, cancel',
            title: 'Update future raids',
        })
        if (accept === 'no') return setUpdateLoading(false)

        const { data: futureResets, error: futureResetsError } = await supabase
            .from('raid_resets')
            .select('id')
            .eq('raid_id', raid_id)
            .neq('id', reset_id)
            .gt('raid_date', new Date().toISOString())
            .order('id', { ascending: true })
            .limit(100)

        if (futureResetsError) {
            alert({ message: 'Error fetching future resets', type: 'error' })
            return setUpdateLoading(false)
        }

        let hasError = false
        for (const futureReset of futureResets || []) {
            const success = await repository.cloneRulesFromReset(reset_id, futureReset.id, user.id)
            if (!success) {
                hasError = true
                break
            }
        }

        if (hasError) {
            alert({ message: 'Error updating some future raids', type: 'error' })
        } else {
            alert('Future raids updated')
        }

        setUpdateLoading(false)
    }, [reset_id, raid_id, supabase, updateLoading, repository, user, alert, yesNo])

    const handleRemoveRule = useCallback(async (ruleEntryId: number) => {
        const success = await repository.removeItemRule(ruleEntryId)
        if (!success) {
            alert({ message: 'Error removing hard reserve rule', type: 'error' })
        }
    }, [repository])

    if (!hardReservations.length) {
        return (
            <div className="flex flex-col gap-2 justify-center items-center relative">
                <span className={'text-gray-500 text-sm'}>No items are banned for this raid</span>
                {isAdmin && (
                    <ImportRules
                        raid_id={raid_id}
                        reset_id={reset_id}
                        reset_date={reset_date}
                    />
                )}
            </div>
        )
    }

    return (
        <>
            <ScrollShadow className="flex flex-col gap-2 h-full overflow-auto max-h-96 scrollbar-pill">
                {hardReservations.map((hr) => (
                    <div key={hr.item_id}
                        className={`flex gap-2 justify-between items-center text-sm text-${getQualityColor(hr?.item?.description?.quality)} p-2 border border-wood rounded`}>
                        <Link href={`https://www.wowhead.com/${domain}/item=${hr.item_id}`}
                            className="flex gap-2 items-center" target="_blank">
                            <img src={hr.item.description.icon} alt={hr.item.name}
                                className={`w-6 border border-${getQualityColor(hr?.item?.description?.quality)} rounded`} />
                            <span>[{hr.item.name}]</span>
                        </Link>
                        {isAdmin && (
                            <button onClick={() => handleRemoveRule(hr.id)}
                                className="text-red-500 hover:text-red-700">
                                <FontAwesomeIcon icon={faClose} />
                            </button>
                        )}
                    </div>
                ))}
            </ScrollShadow>
            {isAdmin && (
                <>
                    <Button
                        onPress={updateFutureRaids}
                        isLoading={updateLoading}
                        isDisabled={updateLoading}
                    >
                        Update future raids
                    </Button>
                    <ImportRules
                        reset_date={reset_date}
                        raid_id={raid_id}
                        reset_id={reset_id}
                    />
                </>
            )}
        </>
    );
}

export function ImportRules({ raid_id, reset_id, reset_date }: { raid_id: string, reset_id: string, reset_date: string }) {
    const { repository } = useRaidItems()
    const { user } = useAuth()
    const supabase = useSupabase()

    const { isOpen, onOpenChange, onClose, onOpen } = useDisclosure()
    const { alert } = useMessageBox()
    const router = useRouter()

    const { data: previousResets = [], isLoading: resetsLoading } = useQuery({
        queryKey: ['previous-resets', raid_id, reset_id, reset_date],
        queryFn: () => repository.fetchPreviousResets(raid_id, reset_id, reset_date),
        enabled: !!supabase && !!raid_id,
    })

    const [selectedResetId, setSelectedResetId] = useState<string | null>(null)

    const { data: previewRules = [], isLoading: rulesLoading } = useQuery({
        queryKey: ['preview-rules', selectedResetId],
        queryFn: () => repository.fetchAllRulesForReset(selectedResetId!),
        enabled: !!selectedResetId,
    })

    const [isPending, setIsPending] = useState(false)
    const importRules = useCallback(async () => {
        if (!supabase || !reset_id || !selectedResetId || !user) return
        setIsPending(true)

        const success = await repository.cloneRulesFromReset(selectedResetId, reset_id, user.id)

        if (!success) {
            alert({ message: 'Error importing rules', type: 'error' })
            setIsPending(false)
            return
        }

        setTimeout(() => {
            setIsPending(false)
            router.refresh()
            onClose()
        }, 2000)
    }, [selectedResetId, reset_id, supabase, repository, user, alert, router, onClose])

    return (
        <>
            <Button
                isLoading={resetsLoading}
                isDisabled={resetsLoading || !previousResets.length}
                onPress={onOpen}
                size="lg"
                startContent={!resetsLoading && <FontAwesomeIcon icon={faCloudArrowDown} />}
            >
                {!previousResets.length ? 'No previous resets' : 'Import rules'}
            </Button>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                scrollBehavior="inside"
                className="scrollbar-pill"
                onOpenChange={onOpenChange}
                isDismissable={!isPending}
            >
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader>
                                <h2 className="text-xl font-bold">Import Rules from Previous Raid</h2>
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-semibold">Select a previous raid reset:</label>
                                    <select
                                        className="bg-dark border border-wood rounded p-2 text-sm"
                                        value={selectedResetId || ''}
                                        onChange={(e) => setSelectedResetId(e.target.value || null)}
                                    >
                                        <option value="">-- Select a reset --</option>
                                        {previousResets.map((reset) => (
                                            <option key={reset.id} value={reset.id}>
                                                {reset.name} - {moment(reset.raid_date).format('MMM D, YYYY')}
                                            </option>
                                        ))}
                                    </select>

                                    {selectedResetId && (
                                        <div className="mt-2">
                                            <h3 className="text-sm font-semibold mb-2">
                                                Rules to import ({rulesLoading ? '...' : previewRules.length}):
                                            </h3>
                                            <ScrollShadow className="flex flex-col gap-2 max-h-64 overflow-auto scrollbar-pill">
                                                {rulesLoading ? (
                                                    <span className="text-gray-500 text-sm">Loading rules...</span>
                                                ) : previewRules.length === 0 ? (
                                                    <span className="text-gray-500 text-sm">No rules found for this reset</span>
                                                ) : previewRules.map((rule: any) => (
                                                    <div key={rule.id}
                                                        className={`flex gap-2 items-center text-sm p-2 border border-wood rounded`}>
                                                        {rule.item?.description?.icon && (
                                                            <img src={rule.item.description.icon} alt={rule.item?.name}
                                                                className={`w-6 border border-${getQualityColor(rule.item?.description?.quality)} rounded`} />
                                                        )}
                                                        <span className={`text-${getQualityColor(rule.item?.description?.quality)}`}>
                                                            [{rule.item?.name || `Item ${rule.item_id}`}]
                                                        </span>
                                                        <span className="text-gray-400 text-xs ml-auto">
                                                            {rule.rule?.type?.replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </ScrollShadow>
                                        </div>
                                    )}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    isLoading={isPending}
                                    isDisabled={isPending || !selectedResetId || previewRules.length === 0}
                                    onPress={() => importRules()}>
                                    Import
                                </Button>
                                <Button
                                    isDisabled={isPending}
                                    onPress={onClose}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
