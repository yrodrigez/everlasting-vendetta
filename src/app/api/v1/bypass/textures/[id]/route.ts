import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest, context: any) {
    const {id} = await context.params;
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/textures/${id}`;


    try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            console.log('erro fetchign', baseUrl)
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
