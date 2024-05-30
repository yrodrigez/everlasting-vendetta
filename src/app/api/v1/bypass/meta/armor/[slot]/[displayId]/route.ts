import {NextRequest, NextResponse} from "next/server";


export async function GET(request: NextRequest, context: any) {

    const {slot, displayId} = context.params;
    if(displayId == 22647) console.log('displayId', displayId)
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/meta/armor/${slot}/${displayId}.json`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        console.log('erro fetchign', baseUrl)
        return new NextResponse(null, {status: response.status});
    }
    const data = await response.json();

    return new NextResponse(JSON.stringify(data))
}
