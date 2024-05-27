import {NextResponse} from "next/server";
import {NextApiRequest} from "next";

export async function GET(request: NextApiRequest) {
    const url = new URL(request.url ?? '');

    const id = url.pathname.split('/').pop();
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/textures/${id}`;


    try {
        const response = await fetch(baseUrl);
        if(!response.ok) {
            console.log('erro fetchign')
            throw new Error('Error')
        }
        const imageBuffer = await response.arrayBuffer();

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/png'
            }
        })
    } catch (e) {
        return new NextResponse(JSON.stringify({error: true}), {
            status: 500
        })
    }
}
