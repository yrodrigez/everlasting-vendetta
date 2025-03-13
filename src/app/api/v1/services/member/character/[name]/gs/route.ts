import {NextRequest, NextResponse} from "next/server";
import {gearScore} from "@/app/lib/supa-functions/gearScore";

export const maxDuration = 60;
export async function GET(request: NextRequest, context: any) {
    const params = await context.params;
    const name = (params?.name ?? '').toLowerCase();

    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'

    const data = await gearScore(name, force)
    return NextResponse.json(data);
}
