import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest, context: any) {

    const {raceId} = await context.params;
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/meta/character/${raceId}.json`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        console.log('erro fetchign', baseUrl)
        return new NextResponse(null, {status: response.status});
    }
    const data = await response.json();

    return new NextResponse(JSON.stringify(data))
}
