export interface BnetTokenResponse {
    access_token: string;
    expires_in: number;
    token_type?: string;
    scope?: string;
}

export interface BnetOAuthGateway {
    exchangeCode(params: { code: string; redirectUri: string }): Promise<BnetTokenResponse>;
}
