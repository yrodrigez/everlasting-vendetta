import * as cheerio from 'cheerio'

interface Material {
    name: string;
    quantity: number;
    itemid: number;
}

interface CraftedItem {
    name: string;
    itemId: number;
}

type CraftingResult = CraftedItem & {
    materials: Material[];
}

/**
 * Parses the provided HTML and returns the crafting result.
 *
 * The function extracts:
 * - The crafted item from the `<span class="q4">` block which contains an `<a>` with an href like `/classic/item=236696/icebane-bracers`
 * - The reagents from the second `<div class="indent q1">` element. Each reagent is represented as an `<a>` with a href containing the item id,
 *   and the quantity is expected to be in the following text node (e.g., " (4)").
 *
 * @param html - The HTML string to parse.
 * @returns An object containing the crafted item and an array of materials.
 */
export function parseCraftingHtml(html: string): CraftingResult {
    const $ = cheerio.load(html);

    const spellAnchor = $('td > a.whtt-name[href*="/classic/spell="]').first() /// <a class="whtt-name q2" href="/classic/spell=19666/silver-skeleton-key"
    const itemName = (spellAnchor.attr('href') || '').split('/').pop() || '';
    const spellName = spellAnchor.text().trim();
    let result: CraftingResult = {
        materials: [],
        ...{name: spellName, itemId: 0,},
    };




    const craftedAnchor = $(`a[href*="/classic/item="][href*="/${itemName}"]`).first();
    if (craftedAnchor.length) {
        const craftedHref = craftedAnchor.attr('href') || '';
        const craftedIdMatch = craftedHref.match(/\/classic\/item=(\d+)/);
        if (craftedIdMatch) {
            const craftedId = parseInt(craftedIdMatch[1], 10);
            result = {...result, name: spellName, itemId: craftedId, materials: []} as CraftingResult;
        }
    }

    const indentDivs = $('div.indent.q1');
    if (indentDivs.length > 0) {
        const reagentsDiv = indentDivs.eq(1).find('a').length ? indentDivs.eq(1) : indentDivs.eq(0)

        reagentsDiv.find('a').each((_, elem) => {
            const anchor = $(elem);
            const materialName = anchor.text().trim();
            const href = anchor.attr('href') || '';
            const idMatch = href.match(/\/classic\/item=(\d+)/);
            let itemid = 0;
            if (idMatch) {
                itemid = parseInt(idMatch[1], 10);
            }

            // Get the quantity from the text node immediately following the anchor.
            // Cheerio gives us access to the underlying node, which we can use to access nextSibling.
            if (!("nextSibling" in elem)) {
                return;
            }
            const nextNode = elem.nextSibling;
            let quantity = 1; // default quantity if not specified
            if (nextNode && nextNode.type === 'text') {
                const text = nextNode.data || '';
                const quantityMatch = text.match(/\((\d+)\)/);
                if (quantityMatch) {
                    quantity = parseInt(quantityMatch[1], 10);
                }
            }

            result.materials.push({name: materialName, quantity, itemid});
        });
    }

    return result;
}

export default parseCraftingHtml;
