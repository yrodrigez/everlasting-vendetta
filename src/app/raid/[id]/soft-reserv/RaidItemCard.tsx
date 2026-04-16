import { Character, LootHistoryEntry, RaidItem, RaidLootItemRule, ReserveRule } from "@/app/raid/[id]/soft-reserv/types";
import { useCharacterStore } from "@/components/characterStore";
import { useAuth } from "@/context/AuthContext";
import { useWoWZamingCss } from '@/hooks/useWoWZamingCss';
import { GUILD_NAME } from '@/util/constants';
import { createRosterMemberRoute } from '@/util/create-roster-member-route';
import {
    faCartPlus,
    faClose,
    faGavel,
    faHistory,
    faLock,
    faPlus,
    faShieldAlt,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Chip, Modal, ModalContent, ScrollShadow, Tooltip } from "@heroui/react";
import { BowArrow, Cross, Shield, ShieldAlert, Swords } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRaidItems } from "./raid-items-context";
import { useItemDetails } from "./useItemDetails";

const WOW_CLASSES = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman', 'mage', 'warlock', 'druid'] as const;
const WOW_SPECS = ['tank', 'healer', 'dps', 'rdps'] as const;
const ALLOWED_GUILD_ROLES = ['RAIDER', 'GUILD_MASTER', 'RAID_LEADER', 'COMRADE'] as const;

const isRole = (currentUserRole: string, evalRole: string): boolean => {
    if (!currentUserRole) return false;
    const hierarchy = {
        'GUILD_MASTER': 0,
        'RAID_LEADER': 1,
        'COMRADE': 2,
        'RAIDER': 3,
    };

    return hierarchy[currentUserRole as keyof typeof hierarchy] <= hierarchy[evalRole as keyof typeof hierarchy];
}

const displayGuildRoleName = (role: string) => {
    return role.split('_').map(x => x.toLocaleLowerCase()).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const getSpecIcon = (spec: string) => {
    const size = 12
    switch (spec) {
        case 'tank':
            return <Shield size={size} />;
        case 'healer':
            return <Cross size={size} />;
        case 'dps':
            return <Swords size={size} />;
        case 'rdps':
            return <BowArrow size={size} />;
    }
    return null;
}

export const ItemTooltip = ({ item, qualityColor }: {
    item: RaidItem,
    qualityColor: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}) => {
    return (
        <div className={`flex gap-2 relative`}>
            <img src={item.description.icon} alt={item.name} width={40} height={40}
                className={`max-h-[40px] max-w-[40px] w-[40px] h-[40px] border border-${qualityColor} rounded absolute top-0 -left-11 ${item.isHardReserved ? 'grayscale' : ''}`} />
            <div
                className={`bg-black border border-${qualityColor} rounded max-w-64 p-2 select-none`}
                dangerouslySetInnerHTML={{
                    __html: item.description.tooltip.replaceAll(/<a/g, '<span').replaceAll(/<\/a/g, '</span')
                }} />
        </div>
    );
}

function ReservedByList({ reservedBy }: { reservedBy: Character[] }) {
    if (!reservedBy.length) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <h1 className="text-sm font-bold text-gold flex items-center gap-2">
                    <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
                    Reserved by
                </h1>
                <span className="text-xs text-gray-500 italic">No reserves yet</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 w-full h-full">
            <h1 className="text-sm font-bold text-gold flex items-center gap-2">
                <FontAwesomeIcon icon={faShieldAlt} className="text-xs" />
                Reserved by ({reservedBy.length})
            </h1>
            <ScrollShadow className="flex flex-col gap-1 w-full h-full overflow-auto scrollbar-pill">
                {reservedBy.map((character, i) => (
                    <Link
                        key={`${character.id ?? `${character.name}-${character.realm?.slug}`}-${i}`}
                        href={createRosterMemberRoute(character.name, (character?.realm?.slug ?? 'spineshatter'))}
                        target={'_blank'}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors">
                        <img
                            src={character.avatar ?? '/avatar-anon.png'}
                            alt={character.name}
                            width={28}
                            height={28}
                            className="border-gold border rounded-md min-w-7 min-h-7"
                        />
                        <span className="text-xs font-bold truncate">{character.name}</span>
                    </Link>
                ))}
            </ScrollShadow>
        </div>
    );
}

function ItemLootHistory({ entries, isLoading }: { entries: LootHistoryEntry[], isLoading: boolean }) {
    if (isLoading) {
        return <div className="text-xs text-gray-500 p-2">Loading history...</div>;
    }

    if (!entries.length) {
        return <div className="text-xs text-gray-500 italic p-2">No one has received this item yet</div>;
    }

    return (
        <ScrollShadow className="flex flex-col gap-1 max-h-32 overflow-auto scrollbar-pill">
            {entries.map((entry) => (
                <Link
                    target="_blank"
                    href={`/raid/${entry.raid_id}/loot`}
                    key={entry.id}
                    className="flex items-center justify-between gap-2 p-1.5 rounded bg-white/5"
                >
                    <span
                        className="text-xs font-bold truncate">{entry.character ?? 'Unknown'}</span>
                    <div className="flex items-center gap-2 shrink-0">
                        {entry.offspec === 1 && (
                            <Chip size="sm" variant="flat" classNames={{ base: 'h-4 px-1 bg-gold border border-gold-100 text-dark', content: 'text-[10px] p-0' }}>
                                OS
                            </Chip>
                        )}
                        <span className="text-[10px] text-gray-400">
                            {moment(entry.dateTime).format('MMM D, YYYY')}
                        </span>
                    </div>
                </Link>
            ))}
        </ScrollShadow>
    );
}

function ItemRulesPanel({ rules, isAdmin, resetId, itemId, hardReserve, removeHardReserve }: {
    rules: RaidLootItemRule[];
    isAdmin: boolean;
    resetId: string;
    itemId: number;
    hardReserve?: (itemId: number) => Promise<void>;
    removeHardReserve?: (itemId: number) => Promise<void>;
}) {
    const { repository } = useRaidItems();
    const { user } = useAuth();
    const [showAddForm, setShowAddForm] = useState(false);
    const [availableRules, setAvailableRules] = useState<ReserveRule[]>([]);
    const [selectedRuleId, setSelectedRuleId] = useState<number | null>(null);
    const [ruleValue, setRuleValue] = useState<Record<string, any>>({});
    const [isSaving, setIsSaving] = useState(false);

    const selectedRuleName = useMemo(() => {
        return availableRules.find(r => r.id === selectedRuleId)?.type;
    }, [availableRules, selectedRuleId]);

    const loadAvailableRules = async () => {
        const fetched = await repository.fetchReserveRules();
        setAvailableRules(fetched);
        setShowAddForm(true);
    };

    const handleAddRule = useCallback(async () => {
        if (!selectedRuleId || !user?.id) return;
        if (selectedRuleName === 'allowed_classes' && (!ruleValue.allowed_classes || !ruleValue.allowed_classes.length)) {
            toast.error('Please select at least one class');
            return;
        }
        if (selectedRuleName === 'allowed_specs' && (!ruleValue.allowed_specs || !ruleValue.allowed_specs.length)) {
            toast.error('Please select at least one spec');
            return;
        }

        if (selectedRuleName === 'max_reserves' && (!ruleValue.max_reserves || ruleValue.max_reserves < 1)) {
            toast.error('Please enter a valid number of max reserves');
            return;
        }

        if (selectedRuleName === 'allowed_guild_roles' && (!ruleValue.allowed_guild_roles || !ruleValue.allowed_guild_roles.length)) {
            toast.error('Please select at least one guild role');
            return;
        }

        setIsSaving(true);

        // If adding a hard_reserve rule, also trigger the hard reserve logic
        if (selectedRuleName === 'hard_reserve' && hardReserve) {
            await hardReserve(itemId);
        }

        const success = await repository.addItemRule(resetId, itemId, selectedRuleId, ruleValue, user.id);
        setIsSaving(false);
        if (success) {
            toast.success('Rule added');
            setShowAddForm(false);
            setSelectedRuleId(null);
            setRuleValue({});
        } else {
            toast.error('Failed to add rule');
        }
    }, [selectedRuleId, ruleValue, resetId, itemId, repository, user, selectedRuleName, hardReserve]);

    const handleRemoveRule = async (ruleEntryId: number, ruleType?: string) => {
        // If removing a hard_reserve rule, also remove the hard reserve flag
        if (ruleType === 'hard_reserve' && removeHardReserve) {
            await removeHardReserve(itemId);
        }

        const success = await repository.removeItemRule(ruleEntryId);
        if (success) {
            toast.success('Rule removed');
        } else {
            toast.error('Failed to remove rule');
        }
    };

    const isClassSelected = useCallback((cls: string) => ruleValue.allowed_classes?.includes(cls), [ruleValue.allowed_classes]);
    const isSpecSelected = useCallback((spec: string) => ruleValue.allowed_specs?.includes(spec), [ruleValue.allowed_specs]);
    const renderRuleValueInput = () => {
        if (!selectedRuleName) return null;

        switch (selectedRuleName) {
            case 'allowed_guild_roles':
                return (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {ALLOWED_GUILD_ROLES.map(role => (
                            <Chip
                                key={role}
                                size="sm"
                                variant={ruleValue.allowed_guild_roles?.includes(role) ? 'solid' : 'bordered'}
                                className={`cursor-pointer capitalize ${ruleValue.allowed_guild_roles?.includes(role) ? 'bg-gold text-black' : ' text-gold border-gold'}`}
                                onClick={() => {
                                    const current = ruleValue.allowed_guild_roles || [];
                                    const updated = current.includes(role)
                                        ? current.filter((r: string) => r !== role)
                                        : [...current, role];
                                    setRuleValue({ allowed_guild_roles: updated });
                                }}
                            >
                                {displayGuildRoleName(role)}
                            </Chip>
                        ))}
                    </div>

                );
            case 'allowed_classes':
                return (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {WOW_CLASSES.map(cls => (
                            <Chip
                                key={cls}
                                size="sm"
                                variant={isClassSelected(cls) ? 'solid' : 'bordered'}
                                className={`cursor-pointer capitalize text-${cls} border-${cls} ${isClassSelected(cls) ? `text-dark bg-${cls}` : ``}`}
                                onClick={() => {
                                    const current = ruleValue.allowed_classes || [];
                                    const updated = current.includes(cls)
                                        ? current.filter((c: string) => c !== cls)
                                        : [...current, cls];
                                    setRuleValue({ allowed_classes: updated });
                                }}
                            >
                                {cls}
                            </Chip>
                        ))}
                    </div>
                );
            case 'allowed_specs':
                return (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {WOW_SPECS.map(spec => (
                            <Chip
                                key={spec}
                                size="sm"
                                variant={isSpecSelected(spec) ? 'solid' : 'bordered'}
                                className={`cursor-pointer capitalize ${isSpecSelected(spec) ? 'bg-gold text-black' : ' text-gold border-gold'}`}
                                onClick={() => {
                                    const current = ruleValue.allowed_specs || [];
                                    const updated = current.includes(spec)
                                        ? current.filter((s: string) => s !== spec)
                                        : [...current, spec];
                                    setRuleValue({ allowed_specs: updated });
                                }}
                            >
                                {spec}
                            </Chip>
                        ))}
                    </div>
                );
            case 'max_reserves':
                if (!ruleValue.max_reserves) {
                    setRuleValue({ max_reserves: 1 });
                }
                return (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs">Max:</span>
                        <input
                            type="number"
                            min={1}
                            max={40}
                            value={ruleValue.max_reserves || 0}
                            onChange={(e) => setRuleValue({ max_reserves: parseInt(e.target.value) || 0 })}
                            className="w-16 bg-black/50 border border-gold/30 rounded px-2 py-1 text-xs text-white"
                        />
                    </div>
                );
            case 'guild_only':
                return (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">Guild members only - no value needed</span>
                    </div>
                );
            case 'hard_reserve':
                return (
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">Hard reserve rule - no value needed</span>
                    </div>
                );
            default:
                return null;
        }
    };



    const getRuleDisplayLabel = (rule: RaidLootItemRule) => {
        const name = rule.rule?.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') ?? `Rule #${rule.rule_id}`;
        const val = rule.value;
        if (val?.allowed_classes) return <span>{`${name}: `}{val.allowed_classes.map((x: string) => <span key={x} className={`text-${x} font-bold`}>{x.charAt(0).toUpperCase() + x.slice(1)} </span>)}</span>;
        if (val?.allowed_specs) return <span className="flex gap-1">{`${name}: `}{val.allowed_specs.map((x: string) => <span key={x} className="inline-flex items-center gap-0.5 mr-1">{getSpecIcon(x)} <span className="font-bold">{x.charAt(0).toUpperCase() + x.slice(1)} </span></span>)}</span>;
        if (val?.max_reserves) return `${name}: ${val.max_reserves}`;
        if (val?.allowed_guild_roles) return `${name}: ${val.allowed_guild_roles.map((x: string) => x.split('_').map(x => x.toLocaleLowerCase()).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ')}`;
        return name;
    };

    const isRuleSelected = useCallback((ruleEntryId: number) => {
        return selectedRuleId === ruleEntryId;
    }, [selectedRuleId]);

    return (
        <div className="flex flex-col gap-2">
            {!rules.length && !showAddForm && (
                <span className="text-xs text-gray-500 italic p-2">No rules assigned</span>
            )}
            <div className="flex flex-wrap gap-1">
                {rules.map((rule) => (
                    <Chip
                        key={rule.id}
                        size="sm"
                        variant="flat"
                        classNames={{
                            base: 'bg-gold/10 border border-gold/20',
                            content: 'text-xs text-gold',
                            closeButton: 'text-gold hover:text-red-600'
                        }}
                        onClose={isAdmin ? () => handleRemoveRule(rule.id, rule.rule?.type) : undefined}
                    >
                        {getRuleDisplayLabel(rule)}
                    </Chip>
                ))}
            </div>

            {isAdmin && !showAddForm && (
                <Button
                    size="sm"
                    variant="light"
                    className="text-gold text-xs w-fit"
                    onPress={loadAvailableRules}
                    startContent={<FontAwesomeIcon icon={faPlus} className="text-[10px]" />}
                >
                    Add Rule
                </Button>
            )}

            {isAdmin && showAddForm && (
                <div className="flex flex-col gap-2 p-2 rounded bg-black/30 border border-gold/10">
                    <div className="flex flex-wrap gap-1 p-1">
                        {availableRules.map(rule => (
                            <Chip
                                key={rule.id}
                                size="sm"
                                color="primary"
                                variant={isRuleSelected(rule.id) ? 'solid' : 'bordered'}
                                className={`cursor-pointer capitalize ${isRuleSelected(rule.id) ? 'bg-gold text-black' : ' text-gold border-gold'}`}
                                onClick={() => {
                                    setSelectedRuleId(rule.id);
                                    setRuleValue({});
                                }}
                            >
                                {rule.type.replace(/_/g, ' ')}
                            </Chip>
                        ))}
                    </div>
                    {renderRuleValueInput()}
                    <div className="flex gap-2 mt-1">
                        <Button
                            size="sm"
                            className="bg-moss text-white rounded text-xs"
                            isDisabled={!selectedRuleId || isSaving}
                            isLoading={isSaving}
                            onPress={handleAddRule}
                        >
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            className="text-xs text-default"
                            onPress={() => {
                                setShowAddForm(false);
                                setSelectedRuleId(null);
                                setRuleValue({});
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ModalItemContent({
    item,
    qualityColor,
    reservedBy,
    reserve,
    remove,
    hardReserve,
    removeHardReserve,
    isLoading,
    isAdmin,
    resetId,
    onClose,
}: {
    item: RaidItem;
    qualityColor: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    reservedBy: Character[];
    reserve?: (itemId: number) => Promise<void>;
    remove?: () => Promise<void> | void;
    hardReserve?: (itemId: number) => Promise<void>;
    removeHardReserve?: (itemId: number) => Promise<void>;
    isLoading: boolean;
    isAdmin: boolean;
    resetId: string;
    onClose: () => void;
}) {
    const { lootHistory, itemRules, isLoading: detailsLoading } = useItemDetails(item.id, resetId);
    const [activeTab, setActiveTab] = useState<'history' | 'rules'>('rules');
    const selectedCharacter = useCharacterStore(state => state.selectedCharacter);
    const { user } = useAuth();
    useEffect(() => {
        if (!itemRules.length) setActiveTab('history');
        else if (activeTab === 'history') setActiveTab('rules');
    }, [itemRules.length]);
    const ruleViolation = useMemo(() => {
        if (!itemRules.length || !selectedCharacter) return null;

        for (const rule of itemRules) {
            const ruleType = rule.rule?.type;
            const val = rule.value;

            if (ruleType === 'allowed_classes' && val?.allowed_classes?.length) {
                const playerClass = selectedCharacter.playable_class?.name?.toLowerCase();
                if (playerClass && !val.allowed_classes.includes(playerClass)) {
                    return `Restricted to: ${val.allowed_classes.join(', ')}`;
                }
            }

            if (ruleType === 'allowed_specs' && val?.allowed_specs?.length) {
                const playerSpec = selectedCharacter.selectedRole?.toLowerCase();
                if (playerSpec && !playerSpec.split('-').some(spec => val.allowed_specs.includes(spec))) {
                    return `Restricted to: ${val.allowed_specs.join(', ')}`;
                }
            }

            if (ruleType === 'guild_only') {
                if (!selectedCharacter.guild?.name?.toLocaleLowerCase().includes(GUILD_NAME.toLocaleLowerCase())) {
                    return 'Guild members only';
                }
            }

            if (ruleType === 'max_reserves' && val?.max_reserves) {
                const currentReserves = reservedBy.filter(
                    c => c.id === selectedCharacter.id
                ).length;
                if (currentReserves >= val.max_reserves) {
                    return `Max ${val.max_reserves} reserve(s) reached`;
                }
            }

            if (ruleType === 'hard_reserve') {
                return 'This item is hard reserved';
            }

            if (ruleType === 'allowed_guild_roles' && val?.allowed_guild_roles?.length) {
                const playerGuildRole = user?.roles ? val.allowed_guild_roles.find((role: string) => user.roles.some(userRole => isRole(userRole, role))) : null;
                if (!playerGuildRole) {
                    return `Restricted to guild roles: ${val.allowed_guild_roles.map((role: string) => displayGuildRoleName(role)).join(', ')}`;
                }
            }
        }

        return null;
    }, [itemRules, selectedCharacter, reservedBy]);

    const isReserveBlocked = !!ruleViolation;

    return (
        <div className={`flex flex-col gap-3 bg-wood border border-wood-100 rounded-lg overflow-hidden relative`}>
            {/* Top accent gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-${item.isHardReserved ? 'poor' : qualityColor}`} />

            {/* Header bar */}
            <div className="flex items-center justify-between px-3 pt-4">
                <div className="flex items-center gap-2">
                    {item.isHardReserved && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <FontAwesomeIcon icon={faLock} className="text-red-500 animate-pulse" />
                            <span>Hard Reserved</span>
                        </div>
                    )}
                </div>
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="text-default rounded"
                    onPress={onClose}
                >
                    <FontAwesomeIcon icon={faClose} />
                </Button>
            </div>

            {/* Main content: tooltip + reserved by */}
            <div className="flex flex-col sm:flex-row gap-4 px-3">
                {/* Left: Item tooltip */}
                <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-center">
                        <div className="w-8" />
                        <ItemTooltip qualityColor={qualityColor} item={item} />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 justify-center">
                        {reserve && !item.isHardReserved && (
                            <Tooltip content={ruleViolation ?? "Reserve this item"}>
                                <div>
                                    <Button
                                        onPress={() => {
                                            if (isReserveBlocked) {
                                                toast.error(ruleViolation);
                                                return;
                                            }
                                            reserve?.(item.id);
                                        }}
                                        isDisabled={isLoading || isReserveBlocked}
                                        isIconOnly
                                        className={`${isReserveBlocked ? 'bg-gray-600' : 'bg-moss'} text-default rounded border ${isReserveBlocked ? 'border-gray-700' : 'border-moss-100'}`}
                                    >
                                        <FontAwesomeIcon icon={faCartPlus} />
                                    </Button>
                                </div>
                            </Tooltip>
                        )}
                        {!item.isHardReserved && (
                            <Tooltip content="Remove your reserve">
                                <Button
                                    onPress={() => remove?.()}
                                    isIconOnly
                                    isDisabled={isLoading || !remove}
                                    className="bg-red-600 text-default rounded border border-red-700"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </Tooltip>
                        )}
                    </div>
                </div>

                {/* Right: Reserved by list */}
                <div className="sm:w-48 sm:border-l sm:border-white/10 sm:pl-4">
                    <ReservedByList reservedBy={reservedBy} />
                </div>
            </div>

            {/* Bottom section: tabs */}
            <div className="bg-black/30 border-t border-white/10">
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'rules'
                            ? 'text-gold border-b-2 border-gold'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <FontAwesomeIcon icon={faGavel} className="text-[10px]" />
                        Rules
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-colors ${activeTab === 'history'
                            ? 'text-gold border-b-2 border-gold'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        <FontAwesomeIcon icon={faHistory} className="text-[10px]" />
                        Loot History
                    </button>
                </div>
                <div className="p-3 min-h-20">
                    {activeTab === 'rules' && (
                        <ItemRulesPanel
                            rules={itemRules}
                            isAdmin={isAdmin}
                            resetId={resetId}
                            itemId={item.id}
                            hardReserve={hardReserve}
                            removeHardReserve={removeHardReserve}
                        />
                    )}
                    {activeTab === 'history' && (
                        <ItemLootHistory entries={lootHistory} isLoading={detailsLoading} />
                    )}
                </div>
            </div>
        </div>
    );
}

export function RaidItemCard({
    item,
    reserve,
    remove,
    reservedBy,
    isClicked,
    setIsClicked,
    hardReserve,
    removeHardReserve,
    isLoading,
    resetId,
    isAdmin,
}: {
    item: RaidItem;
    reserve?: (itemId: number) => Promise<void>;
    remove?: () => Promise<void> | void;
    hardReserve?: (itemId: number) => Promise<void>;
    removeHardReserve?: (itemId: number) => Promise<void>;
    reservedBy?: Character[];
    isClicked: boolean;
    setIsClicked: (itemId: number) => void;
    isLoading: boolean;
    resetId: string;
    isAdmin: boolean;
}) {
    const qualityColors = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
    const qualityColor = (qualityColors[item.description.quality ?? 0] || 'common') as 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    useWoWZamingCss();
    const reserveCount = reservedBy?.length ?? 0;

    return (
        <>
            <div
                onClick={() => setIsClicked(item.id)}
                className={`flex justify-center p-2 mt-4 rounded-md w-40 lg:w-32 h-24 bg-gradient-to-b border-2 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg relative
                    border-${item.isHardReserved ? 'poor' : qualityColor}
                    ${item.isHardReserved ? 'border-dashed border-poor' : 'border-solid'}
                    bg-gradient-${item.isHardReserved ? 'poor' : qualityColor}
                    shadow-${qualityColor}`}
            >
                {reserveCount > 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <Chip
                            size="sm"
                            classNames={{
                                base: `h-5 min-w-5 px-1 bg-dark border border-gold/50 flex items-center justify-center`,
                                content: 'text-[10px] font-bold text-gold p-0 text-center',
                            }}
                        >
                            {reserveCount}
                        </Chip>
                    </div>
                )}
                <div className="relative flex flex-col gap-2 items-center justify-between pt-6">
                    <img
                        src={item.description.icon}
                        alt={item.name}
                        width={46}
                        height={46}
                        className={`absolute -top-5 rounded-md border border-${qualityColor} min-w-10 max-w-10 min-h-10 max-h-10 ${item.isHardReserved ? 'grayscale' : ''}`}
                    />
                    <span className="text-xs font-bold text-center leading-tight">{item.name}</span>
                    {item.hasRules && !item.isHardReserved && (
                        <span className="bg-legendary/30 text-xs text-default flex items-center gap-1 py-0.5 px-1 rounded-lg border border-legendary/50">
                            <ShieldAlert size={14} />
                            restricted
                        </span>
                    )}
                    {item.isHardReserved && (
                        <div className="text-[.5em] font-bold text-center text-gray-800 transition-all flex items-center gap-2 justify-center absolute -bottom-2">
                            <div>Hard Reserved</div>
                            <span className="animate-pulse text-red-500">
                                <FontAwesomeIcon icon={faLock} />
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <Modal
                placement="center"
                isOpen={isClicked}
                scrollBehavior="outside"
                size="xl"
                hideCloseButton={true}

            >
                <ModalContent className="!bg-transparent !shadow-none">
                    {() => (
                        <ModalItemContent
                            item={item}
                            qualityColor={qualityColor}
                            reservedBy={reservedBy ?? []}
                            reserve={reserve}
                            remove={remove}
                            hardReserve={hardReserve}
                            removeHardReserve={removeHardReserve}
                            isLoading={isLoading}
                            isAdmin={isAdmin}
                            resetId={resetId}
                            onClose={() => setIsClicked(0)}
                        />
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
