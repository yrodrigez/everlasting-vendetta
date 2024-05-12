import {useFiltersStore} from "@/app/raid/[id]/soft-reserv/filtersStore";
import {Chip, Input} from "@nextui-org/react";
import React from "react";

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

    return (
        <div
            className={`flex flex-col w-full`}
        >
            <Input
                value={name}
                onChange={(e) => {
                    if (name !== e.target.value) setName(e.target.value)
                }}
                label="Filter" id="filter" type="filter"/>
            <ItemClassFilter/>
            <ItemSubClassFilter/>
            <InventoryTypeFilter/>
            <QualityFilter/>
        </div>
    )
}
