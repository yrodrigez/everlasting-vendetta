import {NextResponse} from "next/server";
import {NextApiRequest} from "next";

export async function GET(request: NextApiRequest) {
    const url = new URL(request.url ?? '');
    const raceId = url.pathname.split('/').pop();
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/meta/character/${raceId}`;
    const response = await fetch(baseUrl);
    if (!response.ok) {

        return new NextResponse(null, {status: response.status});
    }
    const data = await response.json();

    return new NextResponse(JSON.stringify(data))
}
