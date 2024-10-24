//2fbb4cbd6e9fdb2b8ee6b0c53dec03a7

import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url).searchParams.get('url')
    if (!url) {
        return new NextResponse('URL is required', {
            status: 400
        })
    }

    const response = await fetch(`https://api.linkpreview.net`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Linkpreview-Api-Key': '2fbb4cbd6e9fdb2b8ee6b0c53dec03a7',
        },
        mode: 'cors',
        body: JSON.stringify({q: url})
    })

    if (!response.ok) {
        return new NextResponse('Error fetching link preview', {
            status: 500
        })
    }

    const data = await response.json()
    return new NextResponse(JSON.stringify(data), {
        headers: {
            'content-type': 'application/json'
        }
    })
}
