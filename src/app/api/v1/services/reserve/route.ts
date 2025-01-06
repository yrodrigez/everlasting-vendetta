import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import createServerSession from "@utils/supabase/createServerSession";

export async function DELETE(request: NextRequest) {
    const {supabase} = await createServerSession({cookies})
    const url = new URL(request.url)
    const memberId = url.searchParams.get('memberId')
    const resetId = url.searchParams.get('resetId')
    const reservationId = url.searchParams.get('reservationId')

    if(!reservationId) {
        if (!memberId || !resetId) {
            return NextResponse.json({error: 'Error - memberId and resetId are mandatory!'},)
        }
    }

    if (reservationId) {
        const {data: lootData, error: lootError} = await supabase.from('raid_loot_reservation')
            .delete()
            .eq('id', reservationId)

        if (lootError) {
            console.error(lootError)
            return NextResponse.json({error: `Error deleting loot reservation ${reservationId} for member ${memberId} in reset ${resetId}`}, {
                status: 500
            })
        }

        return NextResponse.json({
            data: {
                deleted: lootData,
                memberId,
                resetId,
                reservationId
            }
        }, {
            status: 200
        })
    }

    const {data, error} = await supabase.from('raid_loot_reservation')
        .delete()
        .eq('member_id', memberId)
        .eq('reset_id', resetId)


    if (error) {
        return NextResponse.json({error: `Error deleting reservations for member ${memberId} in reset ${resetId}`},)
    }

    return NextResponse.json({data})
}
