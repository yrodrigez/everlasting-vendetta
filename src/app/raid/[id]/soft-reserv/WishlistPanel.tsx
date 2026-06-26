'use client'

import { useFiltersStore } from "@/app/raid/[id]/soft-reserv/filtersStore";
import { useRaidItems } from "@/app/raid/[id]/soft-reserv/raid-items-context";
import { faHeart, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Chip, ScrollShadow, Tooltip } from "@heroui/react";

const qualityColors = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as const;

export function WishlistPanel() {
    const {
        wishlistItems,
        isWishlistLoading,
        removeFromWishlist,
        reservesByItem,
        setSelectedItemId,
    } = useRaidItems();
    const clearFilters = useFiltersStore(state => state.clear);

    const selectItem = (itemId: number) => {
        clearFilters();
        setSelectedItemId(itemId);
    }

    return (
        <div className="w-full shrink-0 rounded-md border border-gold/30 bg-dark/80 p-2 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faHeart} className="text-gold text-sm" />
                    <h3 className="text-sm font-bold text-gold">Wishlist</h3>
                    <Chip
                        size="sm"
                        classNames={{ base: 'h-5 bg-gold/10 border border-gold/30', content: 'text-[10px] text-gold font-bold' }}
                    >
                        {wishlistItems.length}
                    </Chip>
                </div>
            </div>

            {isWishlistLoading && (
                <div className="px-1 pt-2 text-xs text-gray-400">Loading wishlist...</div>
            )}

            {!isWishlistLoading && wishlistItems.length === 0 && (
                <div className="px-1 pt-2 text-xs text-gray-500">No wishlist items yet. Use the heart on loot cards to save items here.</div>
            )}

            {!isWishlistLoading && wishlistItems.length > 0 && (
                <ScrollShadow orientation="horizontal" className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-pill">
                    {wishlistItems.map(item => {
                        const qualityColor = qualityColors[item.description.quality ?? 0] || 'common';
                        const reserveCount = reservesByItem.find(reservedItem => reservedItem.item.id === item.id)?.reservations.length ?? 0;

                        return (
                            <div
                                key={item.id}
                                className={`flex min-w-56 max-w-64 items-center gap-2 rounded-md border border-${qualityColor}/70 bg-black/30 p-2`}
                            >
                                <button
                                    type="button"
                                    onClick={() => selectItem(item.id)}
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                >
                                    <img
                                        src={item.description.icon}
                                        alt={item.name}
                                        width={34}
                                        height={34}
                                        className={`h-8 w-8 min-w-8 rounded border border-${qualityColor}`}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-xs font-bold text-default">{item.name}</span>
                                    {reserveCount > 0 && (
                                        <Chip
                                            size="sm"
                                            classNames={{ base: 'h-5 min-w-5 bg-dark border border-gold/50', content: 'text-[10px] text-gold font-bold' }}
                                        >
                                            {reserveCount}
                                        </Chip>
                                    )}
                                </button>
                                <Tooltip content="Remove from wishlist">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        className="h-7 w-7 min-w-7 rounded bg-red-600 text-default border border-red-700"
                                        onPress={() => removeFromWishlist(item.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-[11px]" />
                                    </Button>
                                </Tooltip>
                            </div>
                        )
                    })}
                </ScrollShadow>
            )}
        </div>
    )
}
