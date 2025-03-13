import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import WoWService from "@services/wow-service";
import {NextRequest, NextResponse} from "next/server";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        if (!body || !Array.isArray(body)) {
            console.error('Invalid request body:', body)
            return NextResponse.json({count: 0});
        }

        const {supabase} = await createServerSession({cookies})
        const {fetchEquipment} = new WoWService()

        const res = await Promise.all(body.map(async (characterName: string) => {
            const equipment = await fetchEquipment(characterName?.toLowerCase())

            const itemsIds = equipment?.equipped_items?.map((item: any) => item?.item?.id) ?? []

            const {data, error} = await supabase.from('wow_items').select('details').in('id', itemsIds)
            if (error) {
                console.error('Error fetching items supabase supabase:', error)
                return {count: 0}
            }

            const count = (data?.filter(({details}) => details?.tooltip?.toLowerCase().indexOf('sanctified') !== -1) ?? []).length
            const extras = (data?.filter(({details}) => details?.tooltip?.toLowerCase().indexOf('Treats your Seal of the Dawn bonus as if you were wearing 2 additional Sanctified items'.toLowerCase()) !== -1) ?? []).length

            return {count: count + (extras > 1 ? 2 : 0), name: characterName, characterId: equipment?.character.id}
        }));

        return NextResponse.json(res)
    } catch (e) {
        console.error('Error fetching sanctified items:', e)
        return NextResponse.json([{count: 0}]);
    }
}
