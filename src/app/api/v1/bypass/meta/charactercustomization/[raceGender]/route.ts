import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, context: any) {
    const { raceGender } = await context.params;
    const baseUrl = `https://wow.zamimg.com/modelviewer/live/meta/charactercustomization/${raceGender}.json`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        console.log('erro fetchign', baseUrl)
        return new NextResponse(null, { status: response.status });
    }
    const data = await response.json();

    return new NextResponse(JSON.stringify(data))
}
