import {NextRequest, NextResponse} from "next/server";
import WoWService from "@services/wow-service";
import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";

export async function GET(_: NextRequest, context: any) {
    const {characterName} = await context.params;

    if (!characterName) {
        return NextResponse.json({count: 0});
    }
    const {supabase} = await createServerSession({cookies})

    const {fetchEquipment} = new WoWService()

    const equipment = await fetchEquipment(characterName?.toLowerCase())

    const itemsIds = equipment?.equipped_items?.map((item: any) => item?.item?.id) ?? []

    const {data, error} = await supabase.from('wow_items').select('details').in('id', itemsIds)
    if (error) {
        console.error('Error fetching items:', error)
        return NextResponse.json({count: 0});
    }

    const count = (data?.filter(({details}) => details?.tooltip?.toLowerCase().indexOf('sanctified') !== -1) ?? []).length
    const extras = (data?.filter(({details}) => details?.tooltip?.toLowerCase().indexOf('Treats your Seal of the Dawn bonus as if you were wearing 2 additional Sanctified items'.toLowerCase()) !== -1) ?? []).length

    return NextResponse.json({count: count + (extras > 1 ? 2 : 0), name: characterName, characterId: equipment?.character.id});
}