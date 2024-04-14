import {NextRequest, NextResponse} from "next/server";
import WoWService from "@/app/services/wow-service";


export async function GET(request: NextRequest) {
    const url = new URL(request.url)
    const characterName = url.searchParams.get('characterName')
    if (!characterName) {
        return NextResponse.json({error: 'Error - characterName is mandatory!'})
    }
    const wowService = new WoWService()
    const characterInfo = await wowService.fetchMemberInfo(characterName)

    return NextResponse.json({character: characterInfo})
}
