import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import createServerSession from "@utils/supabase/createServerSession";

export async function DELETE(request: NextRequest) {
    const {supabase} = await createServerSession({cookies})
    const url = new URL(request.url)
    const memberId = url.searchParams.get('memberId')
    const resetId = url.searchParams.get('resetId')

    if (!memberId || !resetId) {
        return NextResponse.json({error: 'Error - memberId and resetId are mandatory!'}, )
    }

    const {data, error} = await supabase.from('raid_loot_reservation')
        .delete()
        .eq('member_id', memberId)
        .eq('reset_id', resetId)

    if (error) {
        return NextResponse.json({error: `Error deleting reservations for member ${memberId} in reset ${resetId}`}, )
    }

    return NextResponse.json({data})
}
