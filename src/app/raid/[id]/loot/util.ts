import {CharacterWithLoot, RaidLoot} from "@/app/raid/[id]/loot/components/types";

export function parseLootCsv(csv: string): string[][] {
    return csv.trim().split('\n').map((row) => row.split(',').map((cell) => cell.trim().replaceAll('"', '').replaceAll("'", '').replaceAll('\r', '')))
}


export function validateLootCsv(csv: string[][]) {
    if (csv[0].length !== 5) {
        throw new Error('Invalid CSV format. Expected 5 columns')
    }

    if (csv[0][0] !== 'dateTime' || csv[0][1] !== 'character' || csv[0][2] !== 'itemID' || csv[0][3] !== 'offspec' || csv[0][4] !== 'id') {
        console.log(csv)
        throw new Error('Invalid CSV format. Expected columns: dateTime, character, itemID, offspec, id')
    }
}

export function convertLootCsvToObjects(csv: string[][]) {

    // dateTime,character,itemID,offspec,id
    // should discard the first row if it's a header
    validateLootCsv(csv)
    if (csv[0][0] === 'dateTime') {
        csv.shift()
    }

    return csv.map(([dateTime, character, itemID, offspec, id]) => ({
        dateTime,
        character,
        itemID: parseInt(itemID),
        offspec,
        id: parseInt(id)
    }))
}

export function groupByCharacter(lootHistory: RaidLoot[] = []): CharacterWithLoot[] {
    return (lootHistory).reduce((acc: CharacterWithLoot[], loot) => {
        const character = acc.find((c) => c.character === loot.character)
        if (!character) {
            acc.push({
                character: loot.character,
                loot: [loot],
                plusses: 0
            })
        } else {
            character.loot.push(loot)
        }
        return acc
    }, [])
}

const cachedItemData: any[] = []
export async function fetchItemDataFromWoWHead(loot: RaidLoot) {
    let itemData = cachedItemData.find((item) => item.itemID === loot.itemID)
    if (itemData) {
        return {
            ...loot,
            item: {
                ...itemData
            }
        }
    }
    const fetchItem = await fetch(`https://nether.wowhead.com/tooltip/item/${loot.itemID}?dataEnv=4&locale=0`)
    const item = await fetchItem.json()
    item.icon = `https://wow.zamimg.com/images/wow/icons/medium/${item.icon}.jpg`
    cachedItemData.push(item)
    return {
        ...loot,
        item: {
            ...item
        }
    }
}
