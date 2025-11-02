import { NextRequest, NextResponse } from "next/server";
import { gearScore } from "@/app/lib/supa-functions/gearScore";
import createServerSession from "@utils/supabase/createServerSession";

export const maxDuration = 60;

export async function GET(request: NextRequest, context: any) {
    const { getSupabase, auth } = await createServerSession();
    const supabase = await getSupabase();
    const params = await context.params;
    const name = (params?.name ?? '').toLowerCase();

    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'
    const user = await auth.getSession();
    if (force && !user) {
        return NextResponse.json({ error: 'Error - force update requires authentication!' }, { status: 401 })
    }
    const [gearScoreData, { data: historicGs, error }] = await Promise.all([
        gearScore(name, force),
        supabase
            .from('highest_gs')
            .select('name: character_name, details')
            .eq('character_name', name)
            .maybeSingle<{
                name: string,
                details: {
                    gs: number | string
                    color: string
                    isFullEnchanted?: boolean
                }
            }>()
    ])

    if (error) {
        console.error('Error fetching gear score:', error);
    }

    if (!gearScoreData) {
        return NextResponse.json(gearScoreData);
    }

    if ((parseInt(String(gearScoreData?.gs), 10) > parseInt(String(historicGs?.details?.gs), 10)) || !historicGs) {
        const { error } = await supabase
            .from('highest_gs')
            .upsert({
                character_name: name,
                details: gearScoreData,
                updated_at: new Date().toISOString()
            }, { onConflict: 'character_name' })

        if (error) {
            console.error('Error updating gear score:', error);
        }

        return NextResponse.json(gearScoreData);
    }

    return NextResponse.json(historicGs.details);
}
