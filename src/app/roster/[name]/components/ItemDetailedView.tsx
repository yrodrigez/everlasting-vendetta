import Link from "next/link";
import {getRuneDescription} from "@/app/roster/[name]/getRuneDescription";

export function ItemDetailedView({item}: { item: any }) {
    const rune = item?.enchantments?.find((enchant: any) => enchant.enchantment_slot.type === 'TEMPORARY')
    const runeKey = rune?.display_string
        .replaceAll(' ', '_')
        .replace(/[.]/g, '_')
        .replace(/[-']/g, '_')
        .toLowerCase() || ''
    const runeDescription = getRuneDescription(runeKey)
    const slotName = item?.slot?.name
    const armorType = item?.item_subclass?.name
    const armorAmount = item?.armor?.display.display_string
    const stats = item?.stats?.map((stat: any) => {
        return stat.display.display_string
    }) || []
    const durability = item?.durability?.display_string
    const requirements = item?.requirements?.level?.display_string || null
    const skill = item?.requirements?.skill?.display_string || null
    const spells = (item?.spells || [])
    const binding = item?.binding?.name
    const limitCategory = item?.limit_category || null
    const set = item?.set

    return (
        <div className={
            `flex flex-col gap text-default-100 max-w-md`
        }>
            <Link
                target={'_blank'}
                href={`https://www.wowhead.com/classic/item=${item.item.id}`}
            >
                <h1 className={`text-lg font-bold text-${item.quality.name.toLowerCase()} underline`}>{item.name}</h1>
            </Link>
            <p>{binding}</p>
            <div className="flex justify-between">
                <p>{slotName}</p>
                <p>{armorType !== 'Miscellaneous' ? armorType : ''}</p>
            </div>
            {limitCategory &&
              <p>{limitCategory}</p>
            }
            <p>{armorAmount}</p>
            {stats.map((stat: string, index: number) => {
                return <p key={index}>{stat}</p>
            })}
            {item.enchantments?.filter((enchant: any) => {
                return enchant.enchantment_slot.type === 'PERMANENT'
            }).map((enchant: any) => {
                return <p className="text-uncommon" key={enchant.enchantment_id}>{enchant.display_string}</p>
            })}
            {rune &&
              <p className="text-uncommon">{rune.display_string}: {runeDescription}</p>
            }
            <p>{durability}</p>
            <p>{requirements}</p>
            <p>{skill}</p>
            {spells.map((spell: any, index: number) => {
                if (!spell.description) return null
                return <p key={spell.spell?.id || index} className="text-uncommon">{spell.description}</p>
            })}
            {set &&
              <div className="mt-unit-lg">
                <p
                  className="text-md font-bold text-yellow-400">{set.item_set?.name} ({set.items.filter((x: any) => x.is_equipped).length}/{set.items.length})</p>
                <div className="ml-unit-lg">
                    {set.items.map((x: any, i: number) => {
                        const {item, is_equipped} = x
                        return (
                            <p key={i} className={is_equipped ? 'text-yellow-200' : 'text-gray-500'}>{item.name}</p>
                        )
                    })}
                </div>
                  <div className="mt-unit-lg">
                  {set.effects.sort((x: any, y: any)=> {
                      return x?.required_count - y?.required_count
                  }).map((x: any, i: number) => (
                      <p key={i} className={`${x.is_active? 'text-uncommon': 'text-gray-300'}`}>{x.display_string}</p>
                  ))}
                  </div>
              </div>
            }
        </div>
    )
}
