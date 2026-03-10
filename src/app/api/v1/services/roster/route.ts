import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {getBlizzardToken} from "@/lib/getBlizzardToken";
import {fetchGuildInfo, getGuildRosterFromGuildInfo} from "@/lib/fetchGuildInfo";


export async function GET() {
    const token = (await cookies()).get('bnetToken')?.value || (await getBlizzardToken()).token
    if (!token) {
        throw new Error('No token found')
    }
    const guildInfo = await fetchGuildInfo(token)
    if (!guildInfo) {
        throw new Error('No guild info found')
    }


    const guildRoster = getGuildRosterFromGuildInfo(guildInfo, [])

    return NextResponse.json(guildRoster)
}
