import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DISCORD_COOKIE_NAME } from "@utils/constants";
import { createDiscordServices } from "@/app/util/discord";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const discordToken = (await cookies()).get(DISCORD_COOKIE_NAME)?.value;

    if (!discordToken) {
        return NextResponse.json({ error: 'No Discord token found' }, { status: 401 });
    }

    try {
        const { getUserUseCase, getUserGuildsUseCase } = createDiscordServices();

        const [user, guilds] = await Promise.all([
            getUserUseCase.execute(discordToken),
            getUserGuildsUseCase.execute(discordToken)
        ]);

        return NextResponse.json({
            user,
            guilds,
            success: true
        });
    } catch (error) {
        console.error('Discord API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Discord user data' },
            { status: 500 }
        );
    }
}