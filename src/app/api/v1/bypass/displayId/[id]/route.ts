import {NextRequest} from "next/server";

export async function GET(request: NextRequest, context: any) {
    const id = context.params.id;
    const baseUrl = `https://www.wowhead.com/classic/item=${id}`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        console.log(baseUrl);
        return new Response(null, {status: response.status});
    }
    const data = await response.text();

    const regex = /&quot;displayId&quot;\s*:\s*([0-9]+)/
    const match = data.match(regex);
    if (!match) {
        console.log('no match');
        return new Response(null, {status: 500});
    }
    const displayId = match[1];

    return new Response(JSON.stringify({displayId}));
}
