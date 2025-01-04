import {NextRequest, NextResponse} from "next/server";


export async function GET(request: NextRequest, context: any) {

    const {id} = await context.params;

    const baseUrl = `https://wow.zamimg.com/modelviewer/live/meta/item/${id}.json`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        console.log('erro fetchign', baseUrl)
        return new NextResponse(null, {status: response.status});
    }
    const data = await response.json();

    return new NextResponse(JSON.stringify(data))
}
