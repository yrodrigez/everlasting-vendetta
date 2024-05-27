import {NextRequest, NextResponse} from "next/server";


export async function GET(request: NextRequest) {

    const url = new URL(request.url ?? '');
    const slot = url.pathname.split('/')[6];
    const displayId = url.toString().split('/').pop();

    const baseUrl = `https://wow.zamimg.com/modelviewer/live/meta/armor/${slot}/${displayId}`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        console.log(url.toString())
        console.log(baseUrl);
        return new NextResponse(null, {status: response.status});
    }
    const data = await response.json();

    return new NextResponse(JSON.stringify(data))
}
