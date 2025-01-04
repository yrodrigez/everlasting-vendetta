import {NextRequest, NextResponse} from "next/server";
import {getItemDisplayId} from "@/app/util/wowhead/getItemDisplayId";

export async function GET(request: NextRequest, context: any) {
    const id = (await context.params).id;
    try {
        const displayId = await getItemDisplayId(id);
        return NextResponse.json({displayId});
    } catch (e: any) {
        console.error(e);
        return new NextResponse(JSON.stringify({error: e?.message ?? e}), {status: 500});
    }
}
