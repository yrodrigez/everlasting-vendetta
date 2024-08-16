import {JSDOM} from 'jsdom';
import {NextRequest, NextResponse} from "next/server";

function findItemMetadata(htmlString: string) {
    if(!htmlString) {
        return null
    }
    const doc = new JSDOM(htmlString).window.document;
    const armorType = doc.querySelector("span.q1")?.textContent;

    function findSlotType(html: string) {
        const slots = ["Head", "Shoulder", "Chest", "Waist", "Legs", "Feet", "Wrist", "Hands", "Neck", "Back", "Finger", "Trinket", "One-Hand", "Off-Hand", "Main Hand", "Off Hand", "Two-Hand", "Ranged", "Tabard", "Shield", "Relic"];
        for (let slot of slots) {
            if (html.includes(`<td>${slot}</td>`)) {
                return slot;
            }
        }
        return "Miscellaneous";
    }

    function isWeapon(armorType: string) {
        const weapons = ["One-Hand", "Off-Hand", "Two-Hand", "Ranged", "Shield", "Relic", "Main Hand", "Off Hand"];
        return weapons.includes(armorType);
    }

    function isArmor(armorType: string) {
        const armors = ["Head", "Shoulder", "Chest", "Waist", "Legs", "Feet", "Wrist", "Hands"];
        return armors.includes(armorType);
    }


    const slotType = findSlotType(doc.body.innerHTML);

    return {
        itemClass: isWeapon(slotType) ? "Weapon" : isArmor(slotType) ? "Armor" : "Miscellaneous",
        itemSubclass: armorType ?? "Miscellaneous",
        inventoryType: slotType.replaceAll(" ", "-"),
    }
}

const fetchItemMetadata = async (itemId: number) => {
    const response = await fetch(`https://nether.wowhead.com/tooltip/item/${itemId}?dataEnv=4&locale=0`);
    const item = await response.json();
    const itemMetadata = findItemMetadata(item.tooltip);
    if(!itemMetadata) {
        return {}
    }
    return {
        name: item.name,
        description: {
            ...item,
            icon: `https://wow.zamimg.com/images/wow/icons/medium/${item.icon}.jpg`,
            ...itemMetadata
        },
        id: itemId
    }
}

export async function GET(request: NextRequest, context: any) {
    const { id } = context.params;
    console.log(`Fetching item metadata for item with id: ${id}`);

    return NextResponse.json((await fetchItemMetadata(parseInt(id))));
}
