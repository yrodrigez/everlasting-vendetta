import {useFiltersStore} from "@/app/raid/[id]/soft-reserv/filtersStore";
import {Button, Chip, Input, Modal, ModalContent, Tooltip} from "@nextui-org/react";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faFilter} from "@fortawesome/free-solid-svg-icons";
import useScreenSize from "@hooks/useScreenSize";

const FilterContainer = ({children}: { children: React.ReactNode }) => {
    return <div className="flex w-full gap-2 p-2 flex-wrap">{children}</div>
}

function QualityFilter() {
    const {qualityName: qualityNamesFilter, setQualityName} = useFiltersStore(state => state)
    const qualityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']

    return (
        <FilterContainer>
            {qualityNames.map((qualityName) => {
                const isClicked = qualityNamesFilter?.includes(qualityName)
                const textClass = isClicked ? `text-${['common', 'uncommon'].includes(qualityName.toLowerCase()) ? 'black' : 'white'}` : `text-${qualityName.toLowerCase()}`
                const backgroundClass = isClicked ? `bg-${qualityName.toLowerCase()} shadow shadow-${qualityName.toLowerCase()} shadow-lg` : `bg-transparent hover:bg-${qualityName.toLowerCase()} hover:shadow hover:shadow-${qualityName.toLowerCase()}`
                const borderClass = isClicked ? `border-2 border-transparent` : `border-2 border-${qualityName.toLowerCase()}`

                return <Chip
                    key={qualityName}
                    className={`${textClass} ${backgroundClass} ${borderClass} cursor-pointer select-none`}
                    onClick={() => {
                        if (qualityNamesFilter?.includes(qualityName)) {
                            setQualityName([])
                        } else {
                            setQualityName([qualityName])
                        }
                    }}>{qualityName}</Chip>
            })}
        </FilterContainer>
    )
}

const ItemClassFilter = () => {
    const {itemClass: itemClassFilter, setItemClass} = useFiltersStore(state => state)
    const itemClasses = ['Armor', 'Weapon', 'Miscellaneous',]

    return <FilterContainer>
        {itemClasses.map((itemClass) => {
            const isClicked = itemClassFilter?.includes(itemClass)
            const textClass = isClicked ? `text-dark font-bold` : `text-gold`
            const backgroundClass = isClicked ? `bg-gold shadow shadow-gold shadow-lg` : `bg-transparent`
            const borderClass = isClicked ? `border-2 border-transparent` : `border-2 border-gold`

            return <Chip
                key={itemClass}
                className={`${textClass} ${backgroundClass} ${borderClass} cursor-pointer select-none`}
                onClick={() => {
                    if (itemClassFilter?.includes(itemClass)) {
                        setItemClass([])
                    } else {
                        setItemClass([itemClass])
                    }
                }}>{itemClass}</Chip>
        })}
    </FilterContainer>
}

const ItemSubClassFilter = () => {
    const {itemSubClass: itemSubClassFilter, setItemSubClass} = useFiltersStore(state => state)
    const itemSubClasses = ['Plate', 'Mail', 'Leather', 'Cloth', 'Sword', 'Axe', 'Mace', 'Shield', 'Polearm', 'Bow', 'Staff', 'Crossbow', 'Dagger', 'Libram', 'Idol', 'Totem', 'Fist Weapon', 'Wand', 'Gun', 'Thrown', 'Miscellaneous']
    return <FilterContainer>
        {itemSubClasses.map((itemSubClass) => {
            const isClicked = itemSubClassFilter?.includes(itemSubClass)
            const textClass = isClicked ? `text-dark font-bold` : `text-gold`
            const backgroundClass = isClicked ? `bg-gold shadow shadow-gold shadow-lg` : `bg-transparent`
            const borderClass = isClicked ? `border-2 border-transparent` : `border-2 border-gold`

            return <Chip
                key={itemSubClass}
                className={`${textClass} ${backgroundClass} ${borderClass} cursor-pointer select-none`}
                onClick={() => {
                    if (itemSubClassFilter?.includes(itemSubClass)) {
                        setItemSubClass([])
                    } else {
                        setItemSubClass([itemSubClass])
                    }
                }}>{itemSubClass}</Chip>
        })}
    </FilterContainer>
}

const InventoryTypeFilter = () => {
    const inventoryTypes = ["Two-Hand", "One-Hand", "Main-Hand", "Off-Hand", "Chest", "Shoulder", "Wrist", "Legs", "Head", "Feet", "Hands", "Waist", "Back", "Ranged", "Neck", "Finger", "Trinket", "Relic", "Miscellaneous"]
    const {inventoryType: inventoryTypeFilter, setInventoryType} = useFiltersStore(state => state)
    return <FilterContainer>
        {inventoryTypes.map((inventoryType) => {
            const isClicked = inventoryTypeFilter?.includes(inventoryType)
            const textClass = isClicked ? `text-dark font-bold` : `text-gold`
            const backgroundClass = isClicked ? `bg-gold shadow shadow-gold shadow-lg` : `bg-transparent`
            const borderClass = isClicked ? `border-2 border-transparent` : `border-2 border-gold`

            return <Chip
                key={inventoryType}
                className={`${textClass} ${backgroundClass} ${borderClass} cursor-pointer select-none`}
                onClick={() => {
                    if (inventoryTypeFilter?.includes(inventoryType)) {
                        setInventoryType([])
                    } else {
                        setInventoryType([inventoryType])
                    }
                }}>{inventoryType}</Chip>
        })}
    </FilterContainer>
}

export function Filters() {
    const {name, setName} = useFiltersStore(state => state)
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
    const {inventoryType, itemSubClass, qualityName, itemClass} = useFiltersStore(state => state)
    const isUsingAdvancedFilters = (((inventoryType?.length ?? 0) > 0) || ((itemSubClass?.length ?? 0) > 0)) || ((qualityName?.length ?? 0) > 0) || ((itemClass?.length ?? 0) > 0)
    const {isDesktop} = useScreenSize()
    return (
        <div
            className={`flex flex-row gap-2 items-center w-full`}
        >
            <Tooltip
                placement="left"
                isOpen={advancedFiltersOpen}
                className="bg-dark rounded border border-dark-100"
                isDisabled={!isDesktop}
                content={(
                    <div className={`flex flex-col gap-2 w-96 relative`}>
                        <Button
                            isIconOnly
                            className="absolute -top-1 -right-2 text-gold"
                            onClick={() => setAdvancedFiltersOpen(false)}
                            variant="light"
                            size="sm"
                        >
                            <FontAwesomeIcon icon={faClose}/>
                        </Button>
                        <ItemClassFilter/>
                        <ItemSubClassFilter/>
                        <InventoryTypeFilter/>
                        <QualityFilter/>
                    </div>
                )}
            >
                <div
                    className="relative w-12 h-12 flex justify-center items-center"
                >
                    {isUsingAdvancedFilters && !advancedFiltersOpen ? (
                        <div
                            className={`absolute -top-1 -right-2 bg-gold text-dark text-xs font-bold rounded-full w-2 h-2 p-2 flex justify-center items-center z-50 border border-gold-100 `}
                        >
                            {(inventoryType?.length ?? 0) + (itemSubClass?.length ?? 0) + (qualityName?.length ?? 0) + (itemClass?.length ?? 0)}
                        </div>
                    ) : null}
                    <Button
                        className={`bg-moss text-gold rounded font-bold ml-2 relative`}
                        isIconOnly
                        size={'lg'}
                        onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
                    >
                        {advancedFiltersOpen ? <FontAwesomeIcon icon={faClose}/> : <FontAwesomeIcon icon={faFilter}/>}
                    </Button>
                </div>
            </Tooltip>
            <Input
                value={name}
                size="sm"
                endContent={
                    name && <Button
                    onClick={(e) => {
                        setName('')
                        // @ts-ignore - blur is a valid function
                        e.target.blur && e.target.blur()
                    }}
                    variant="light"
                    isIconOnly
                    size="sm"
                    className="text-[rgba(19,19,19,0.5)]"
                  >
                    <FontAwesomeIcon icon={faClose}/>
                  </Button>
                }
                onChange={(e) => {
                    if (name !== e.target.value) setName(e.target.value)
                }}
                label="Filter" id="filter" type="filter"/>
            <Modal
                isOpen={advancedFiltersOpen && !isDesktop}
                onClose={() => setAdvancedFiltersOpen(false)}
                className={`bg-transparent border-none shadow-none`}
                hideCloseButton
                scrollBehavior="outside"
            >
                <ModalContent>
                    {(onClose) => (
                        <div className={`flex gap-2 p-2 relative justify-center `}>
                            <Button
                                isIconOnly
                                className="absolute top-2 right-8 text-gold"
                                onClick={onClose}
                                variant="light"
                                size="sm"
                            >
                                <FontAwesomeIcon icon={faClose}/>
                            </Button>
                            <div
                                className={`w-96 border border-gold rounded-lg p-2 bg-dark bg-blend-color select-none`}>
                                <ItemClassFilter/>
                                <ItemSubClassFilter/>
                                <InventoryTypeFilter/>
                                <QualityFilter/>
                            </div>
                        </div>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
