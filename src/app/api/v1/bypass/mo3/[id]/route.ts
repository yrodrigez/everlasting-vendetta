import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PassThrough } from 'stream';

export async function GET(request: NextRequest, context: any) {
    const { id } = await context.params;
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/mo3/${id}`;

    try {
        const response = await fetch(baseUrl, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });

        if (!response.ok) {
            throw new Error('Error fetching the file');
        }

        const passthrough = new PassThrough();

        response.body?.pipe(passthrough);

        return new NextResponse(passthrough as any, {
            headers: {
                'Content-Type': 'application/octet-stream',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    } catch (e) {
        console.error(e);
        return new NextResponse(JSON.stringify({ error: true }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }
}
