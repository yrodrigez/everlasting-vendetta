export function linkAccount({
    accessToken,
    provider,
    providerAccessToken,
    tokenExpiresAt,
    refreshToken,
}: {
    accessToken: string;
    provider: 'discord' | 'bnet' | 'temporal';
    providerAccessToken: string;
    tokenExpiresAt: number;
    refreshToken: string;
}) {

}