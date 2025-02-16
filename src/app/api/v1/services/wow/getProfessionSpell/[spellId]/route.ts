import {NextRequest, NextResponse} from "next/server";
import parseCraftingHtml from "@/app/api/v1/services/wow/getProfessionSpell/[spellId]/parseCraftingHtml";
/*import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import pLimit from 'p-limit';

const limit = pLimit(10);*/

async function fetchProfessionSpell(spellId: any) {
    const spellData = await fetch(`https://nether.wowhead.com/tooltip/spell/${spellId}?dataEnv=4&locale=0`);

    if (!spellData.ok) {
        return spellData
    }

    const spellJson = await spellData.json();
    const data = parseCraftingHtml(spellJson.tooltip);
    if (data.itemId && !isNaN(data.itemId)) {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/services/wow/fetchItem?itemId=${data.itemId}`);
    }

    return {...spellJson, ...data, spellId};
}


export async function GET(request: NextRequest, context: any) {
    const {spellId} = await context.params;
    if (!spellId || isNaN(spellId)) {
        return NextResponse.json({error: "Invalid spellId"}, {status: 400});
    }
/*
    const {supabase} = await  createServerSession({cookies})
    const initialSpells = Array.from(new Set([]));
    const data = await Promise.all(initialSpells.map(x=> limit(() => fetchProfessionSpell(x))));
    const {data:insertStatus, error} = await supabase.from('profession_spells').insert(
        data.filter(Boolean).map(x=>({
            id: x.spellId,
            item_id: x.itemId || null,
            name: x.name,
            profession_id: 6,
            details: {
                tooltip: x.tooltip,
                quality: x.quality,
                materials: x.materials,
                icon: `https://wow.zamimg.com/images/wow/icons/medium/${x.icon}.jpg`,
            }
        }))
    )

    return NextResponse.json({insertStatus, error});*/

    const data = await fetchProfessionSpell(spellId)
    return NextResponse.json(data);
}
