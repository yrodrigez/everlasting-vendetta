'use client'
import {Input, ScrollShadow, Spinner} from "@heroui/react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useInfiniteQuery, useQuery} from "@tanstack/react-query";
import {ItemWithTooltip} from "@/app/raid/[id]/loot/components/LootItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faPlus} from "@fortawesome/free-solid-svg-icons";
import {useSession} from "@hooks/useSession";
import {fetchCharacterProfessionsSpells, fetchProfessionSpells} from "@/app/roster/[name]/components/professions-api";
import {SupabaseClient} from "@supabase/supabase-js";
import useToast from "@utils/useToast";
import {Button} from "@/app/components/Button";
import {faRemove} from "@fortawesome/free-solid-svg-icons/faRemove";
import {useMessageBox} from "@utils/msgBox";
import {useRouter} from "next/navigation";
import {createPortal} from "react-dom";
import {Blendy, createBlendy} from "blendy";
import {ROLE} from "@utils/constants";

export type ProfessionName =
    'Blacksmithing'
    | 'Leatherworking'
    | 'Alchemy'
    | 'Enchanting'
    | 'Engineering'
    | 'Herbalism'
    | 'Mining'
    | 'Skinning'
    | 'Tailoring'
    | 'Cooking'
    | 'First Aid'
    | 'Fishing'
    | 'Unknown'
export type ProfessionSpell = {
    icon: string
    quality: number
    tooltip: string
    materials: Material[]
    isLearned?: boolean
    id: number
    name: string
    craftedItem: any
    profession: {
        name: ProfessionName
        id: number
    }
}

export type Material = {
    name: string
    quantity: number
    itemId: number
}
export type Profession = {
    id: number
    name: ProfessionName
    icon: string
    spells: ProfessionSpell[]
}
const getQualityName = (quality: number) => {
    return [
        'poor',
        'default',
        'uncommon',
        'rare',
        'epic',
        'legendary',
    ][quality] || 'poor'
}

const Material = ({material}: { material: Material }) => {
    const {data: item, error, isLoading} = useQuery({
        queryKey: ['item', material.itemId],
        queryFn: async () => {
            const response = await fetch(`/api/v1/services/wow/fetchItem?itemId=${material.itemId}`)
            if (!response.ok) {
                return {name: 'Unknown', icon: '', quality: 0, tooltip: ''}
            }
            const data = await response.json()

            return data.itemDetails
        },
        staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry: 3,
    })


    return (
        isLoading ? <Spinner
            size={"sm"}
        /> : error ? <div>Failed to load item</div> :
            <div className={`grid grid-cols-2 gap-1 items-center text-${item.qualityName} justify-center`}>
                <div
                    className="flex gap-1 items-center col-span-2 justify-center">
                    <ItemWithTooltip item={item}

                                     className={`w-8 h-8 min-h-8 min-w-8 rounded-md border-${item.qualityName}`}/>
                    x<span>{material.quantity}</span>
                </div>
                <span className={`text-sm col-span-2 text-center`}>[{item.name}]</span>
            </div>
    )
}

const Recipe = ({spell, hideMats, onDelete}: {
    spell: ProfessionSpell,
    hideMats?: boolean,
    onDelete?: (spellId: number) => {}
}) => {
    const qualityColor = useMemo(() => getQualityName(spell.quality), [spell])
    const blendy = useRef<Blendy | null>(null)
    const [isClicked, setIsClicked] = useState(false)
    const blendyToggle = `spell-${spell.id}`
    useEffect(() => {
        blendy.current = createBlendy({animation: 'spring'})
    }, [spell])
    const handleOnClick = useCallback(() => {
        setIsClicked(true)
        blendy.current?.toggle(blendyToggle)
    }, [spell])

    const handleOnClose = useCallback(() => {
        blendy.current?.untoggle(blendyToggle, () => {
            setIsClicked(false)
        })
    }, [spell])
    console.log(spell)
    return (<>
            {isClicked && createPortal((
                    <div
                        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
                        onClick={handleOnClose}>
                        <div data-blendy-to={blendyToggle}
                             onClick={(e) => e.stopPropagation()}
                             className={`w-[600px] h-[400px] flex p-8 border border-wood-100 bg-wood rounded-xl relative overflow-auto scrollbar-pill`}>
                            <div className={`w-full h-full transition-all duration-300`}>
                                <div className="grid grid-cols-1 gap-2 w-full h-full">
                                    <div className="flex gap-2 items-center">
                                        {spell.craftedItem ? <ItemWithTooltip item={spell.craftedItem}
                                                                              className={`w-14 h-14 rounded-md border border-wood-100 border border-${qualityColor}`}/> :
                                            <img
                                                className={`w-14 h-14 rounded-md `}
                                                src={spell.icon}
                                                alt={spell.tooltip}
                                            />}
                                        <span className={`text-${qualityColor} text-2xl`}>[{spell.name}]</span>
                                    </div>
                                    <div className="grid grid-cols-2 place-content-around gap-2 mt-4">
                                        <div className="text-xl col-span-2">Materials:</div>
                                        {spell.materials.map(material => (
                                            <Material key={material.itemId} material={material}/>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <Button size={"sm"} isIconOnly onPress={handleOnClose}
                                    className="absolute top-1 right-1 rounded-full" variant="light">
                                <FontAwesomeIcon icon={faClose} className="text-default"/>
                            </Button>
                        </div>
                    </div>
                ),
                document.body
            )}
            <div
                className={`grid grid-cols-5 rounded-md p-1 gap-1 border border-wood-50 relative group group-hover:border-${qualityColor} duration-300 transition-all cursor-pointer`}
                onClick={handleOnClick}
                data-blendy-from={blendyToggle}>
                <div className="col-span-5 lg:col-span-2 flex gap-2 items-center justify-center lg:justify-start">
                    {spell.craftedItem ? <ItemWithTooltip item={spell.craftedItem}
                                                          className={`w-10 h-10 rounded-md border border-wood-100 border border-${qualityColor}`}/> :
                        <img
                            className={`w-10 h-10 rounded-md `}
                            src={spell.icon}
                            alt={spell.tooltip}
                        />}
                    <span className={`text-${qualityColor}`}>[{spell.name}]</span>
                </div>
                {onDelete && (
                    <div
                        className="absolute -top-1.5 -right-1.5 text-xs opacity-0 group-hover:opacity-100 duration-300 transition-all">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(spell.id)
                            }}
                            className="rounded-full bg-red-600 text-default border border-red-500 w-5 h-5 text-xs">
                            <FontAwesomeIcon icon={faRemove}/>
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

const AddProfession = ({availableProfessions, characterId}: { availableProfessions: { name: string, id: number }[], characterId:number }) => {
    const {supabase, selectedCharacter} = useSession()
    const [selectedProfessionId, setSelectedProfessionId] = useState<number>(availableProfessions[0]?.id)
    const PAGE_SIZE = 50
    const [filterName, setFilterName] = useState<string | null>(null)

    const {
        data,
        error,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['availableSpells', selectedProfessionId],
        initialPageParam: 1,
        queryFn: ({pageParam = 1}) =>
            fetchProfessionSpells(supabase as SupabaseClient, selectedProfessionId, {
                page: pageParam,
                pageSize: PAGE_SIZE,
            }, filterName ? {name: filterName} : undefined),
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage) return undefined;
            const profession = lastPage
            if (!profession || !profession.spells) return undefined;
            if (profession.spells.length < PAGE_SIZE) return undefined;
            return allPages.length + 1;
        },
        enabled: !!selectedCharacter && !!supabase && !!selectedProfessionId,
        staleTime: Infinity,
        retry: 3,
    });

    const spells = useMemo(() => data?.pages.reduce<ProfessionSpell[]>((acc, page) => {
        if (page?.spells) {
            acc.push(...page.spells);
        }
        return acc;
    }, []) || [], [data]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const {scrollTop, clientHeight, scrollHeight} = container;
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
            if (scrollPercentage >= 0.6 && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const {error: toastError, success} = useToast()
    const saveRecipe = useCallback(async (spellId: number) => {
        if (!selectedCharacter || !supabase) return
        const {error} = await supabase.from('member_profession_spells').insert({
            member_id: characterId,
            profession_id: selectedProfessionId,
            spell_id: spellId,
        })

        if (error) {
            if (error.code === '23505') {
                toastError('Recipe already learned')
                return
            }
            toastError('Failed to learn recipe')
            return
        }

        success('Recipe learned')
    }, [supabase, selectedCharacter, selectedProfessionId, characterId])

    const filterRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {

        if (!filterName) {
            refetch();
            return
        }

        if (filterRef.current) {
            clearTimeout(filterRef.current)
        }

        filterRef.current = setTimeout(() => {
            refetch()
        }, 500)

    }, [filterName]);

    return (
        <div className={"w-full flex flex-col h-full"}>
            <div className="w-full h-14 flex items-center justify-around">
                {availableProfessions.map(profession => (
                    <div key={profession.id}
                         className={`flex items-center transition-all cursor-pointer hover:bg-wood-200 duration-300 p-1 border-wood-100 border rounded-md hover:opacity-95 hover:border-default w-14 h-14 ${selectedProfessionId === profession.id ? 'bg-wood-100 border-gold' : ''}`}
                         onClick={() => setSelectedProfessionId(profession.id)}
                    >
                        <img
                            className="rounded-md border border-wood-100 w-12 h-12"
                            src={`/profession-icons/${profession.name.toLowerCase()}.webp`}
                            alt={profession.name}
                        />
                    </div>
                ))}
            </div>
            <div
                className="p-2"
            >
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full h-14"
                    size="lg"
                    onChange={(e) => setFilterName(e.target.value)}

                />
            </div>
            <div
                ref={scrollContainerRef}
                className="w-full h-full scrollbar-pill overflow-auto transition-all duration-300 p-2">
                <div className="flex justify-center h-full w-full items-start">
                    {isLoading ? 'Loading...' : error ? ('Failed to load professions: ' + error.message) : (
                        <div className="grid grid-cols-10 gap-2 p-2 items-center">
                            {spells?.map(spell => (
                                [
                                    <div key={spell.id} className={`col-span-9`}>
                                        <Recipe spell={spell} hideMats/>
                                    </div>,
                                    <div
                                        key={`add-${spell.id}`}
                                        className={`col-span-1`}>
                                        <Button isIconOnly onPress={() => saveRecipe(spell.id)}>
                                            <FontAwesomeIcon icon={faPlus}/>
                                        </Button>
                                    </div>
                                ]
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function CharacterProfessions({professions, characterId, className}: {
    professions: Profession[]
    characterId: number
    className?: string
}) {
    const [selectedProfession, setSelectedProfession] = useState<Profession | null>(professions[0])
    const {supabase, selectedCharacter, tokenUser} = useSession()
    const isOwn = useMemo(() => {
        if(tokenUser) return tokenUser.custom_roles?.includes(ROLE.ADMIN) || tokenUser.custom_roles?.includes(ROLE.MODERATOR) || tokenUser.id === characterId
        return selectedCharacter?.id === characterId
    }, [selectedCharacter, characterId, tokenUser])
    const router = useRouter()
    const {data: availableProfessions, error, isLoading} = useQuery({
        queryKey: ['availableProfession'],
        queryFn: async () => {
            if (!supabase) return []
            const {data, error} = await supabase.from('professions').select('name, id')
                .returns<{
                    name: string
                    id: number
                }[]>()
            if (error) return []
            return data
        },
        enabled: (!!selectedCharacter && isOwn && !!supabase),
        staleTime: Infinity,
    })
    const {data: characterProfessions, refetch: refresh} = useQuery({
        queryKey: ['characterProfessions', characterId],
        queryFn: async () => {
            if (!supabase) return []
            const data = await fetchCharacterProfessionsSpells(supabase, characterId, {spellName: filterName})
            if (!selectedProfession) return data
            setSelectedProfession(!data || !selectedProfession ? null : (data.find(profession => profession.id === selectedProfession?.id) ?? data.reverse()[0] ?? null))
            return data
        },
        initialData: professions || [],
        enabled: !!selectedCharacter && !!supabase,
        retry: 3,
        staleTime: Infinity
    })
    useEffect(() => {
        if (!supabase || !isOwn) return;
        const channel = supabase.channel(`public:member_profession_spells:member_id=eq.${characterId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'member_profession_spells',
            }, async () => {
                await refresh()
                router.refresh()
            }).subscribe()
        return () => {
            supabase?.removeChannel(channel)
        }
    }, [supabase, refresh, selectedCharacter, isOwn, characterId]);

    const {error: toastError} = useToast()
    const {yesNo} = useMessageBox()

    const deleteProfession = useCallback(async (professionId: number) => {
        if (!selectedCharacter || !supabase || !isOwn) return
        const answer = await yesNo({message: 'Are you sure you want to delete this profession?'})
        if (!answer || answer !== 'yes') return
        const {error} = await supabase.from('member_profession_spells').delete().eq('member_id', characterId).eq('profession_id', professionId)
        if (error) {
            console.error(error)
            toastError('Failed to delete profession')
            return
        }
        await refresh()
        setSelectedProfession(null)
    }, [supabase, selectedCharacter, selectedCharacter?.id, characterId, isOwn, yesNo])

    const deleteRecipe = useCallback(async (spellId: number) => {
        if (!selectedCharacter || !supabase || !isOwn) return
        const answer = await yesNo({message: 'Are you sure you want to delete this recipe?'})
        if (!answer || answer !== 'yes') return
        const {error} = await supabase.from('member_profession_spells').delete().eq('member_id', characterId).eq('spell_id', spellId)
        if (error) {
            console.error(error)
            toastError('Failed to delete recipe')
            return
        }
        await refresh()
    }, [supabase, selectedCharacter, selectedCharacter?.id, characterId, isOwn])

    const selectedSpells = useMemo(() => selectedProfession?.spells ? [...selectedProfession?.spells] : [], [characterProfessions, selectedProfession])
    const [filterName, setFilterName] = useState<string | undefined>()

    const filterRef = useRef<NodeJS.Timeout | null>(null)
    useEffect(() => {

        if (!filterName) {
            refresh();
            return
        }

        if (filterRef.current) {
            clearTimeout(filterRef.current)
        }

        filterRef.current = setTimeout(() => {
            refresh()
        }, 500)

    }, [filterName]);



    return !isOwn && !professions.length ? 'This member has not updated his/her professions.' : (
        <div className={className ?? "w-full h-96 bg-wood border border-wood-100 flex gap-2 p-1 rounded-md"}>
            <div className="h-full min-w-18 max-w-18">
                <ScrollShadow className="w-full h-full scrollbar-pill flex flex-col gap-2 p-2">
                    {characterProfessions.map(profession => (
                            <div key={profession.id} className={`group flex items-center transition-all cursor-pointer hover:bg-wood-200 duration-300 p-1 border-wood-100 border hover:border-default
                             rounded-md hover:opacity-95 hover:transform ${selectedProfession?.id === profession.id ? 'bg-wood-100 border-gold' : ''} relative`}
                                 onClick={() => setSelectedProfession(profession)}
                            >
                                <img
                                    className="rounded-md border border-wood-100"
                                    src={profession.icon}
                                    alt={profession.name}
                                />
                                {isOwn && (
                                    <button
                                        onClick={() => deleteProfession(profession.id)}
                                        className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 text-default border border-red-500 w-5 h-5 text-xs opacity-0 group-hover:opacity-100 duration-300 transition-all">
                                        <FontAwesomeIcon icon={faRemove}/>
                                    </button>
                                )}
                            </div>
                        )
                    )}
                    {
                        isOwn &&
                        <div
                            className={`flex items-center justify-center p-1 border-wood-100 border rounded-md w-16 h-16 text-wood-100 hover:text-default hover:bg-wood-200 duration-300 transition-all cursor-pointer hover:border-default
                            ${!selectedProfession ? 'text-gold border-gold' : ''}
                            `}>
                            <div className={`flex items-center cursor-pointer p-4`}
                                 onClick={() => setSelectedProfession(null)}
                            >
                                <FontAwesomeIcon icon={faPlus}/>
                            </div>
                        </div>
                    }
                </ScrollShadow>
            </div>
            <div className="w-full h-full scrollbar-pill overflow-auto">
                {selectedProfession ? (
                    <div className="grid grid-cols-1 gap-2 p-2">
                        <div className="sticky top-0 z-50 bg-wood">
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-full h-14"
                                size="lg"
                                onChange={(e) => { setFilterName(e.target.value) }}

                            />
                        </div>
                        {selectedSpells.map(spell => (
                            <Recipe key={spell.id} spell={spell} onDelete={deleteRecipe}/>
                        ))}
                    </div>
                ) : <div className="flex justify-center h-full w-full items-start">{
                    isLoading ? 'Loading...' : error ? 'Failed to load professions' : (
                        <AddProfession
                            characterId={characterId}
                            availableProfessions={(availableProfessions ?? [])}/>
                    )
                }</div>}
            </div>
        </div>
    )
}