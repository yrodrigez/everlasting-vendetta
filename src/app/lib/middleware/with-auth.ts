import crypto from 'crypto';
import { encrypt } from '@/app/util/auth/crypto';
import { REFRESH_TOKEN_COOKIE_KEY, SESSION_INFO_COOKIE_KEY } from '@/app/util/constants';
import { getMiddleware } from 'with-refresh-token';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';

const isProd = process.env.NODE_ENV === 'production';
const REFRESH_ENDPOINT = `${process.env.NEXT_PUBLIC_EV_API_URL}/auth/refresh`;
const EXPIRY_MARGIN_MS = 60_000;

type CachedEntry = {
  exp: number;
  token: string;
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: number;
  accessTokenExpiry: number;
  sessionCookieValue?: string | null;
  previousRefreshToken?: string;
  shouldRefreshProviderToken?: boolean;
  provider?: string | null;
};

const cache = new Map<string, CachedEntry>();

const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

function resolveCacheKey(refreshToken: string | undefined) {
  if (!refreshToken) {
    return null;
  }
  return hash(refreshToken);
}

function computeExpiry(expirySeconds: number | undefined) {
  if (!expirySeconds || !Number.isFinite(expirySeconds)) {
    return Date.now() + 60_000;
  }
  return Date.now() + expirySeconds * 1000;
}

function setRequestHeader(response: NextResponse, name: string, value: string) {
  const headerName = name.toLowerCase();
  const override = response.headers.get('x-middleware-override-headers');
  const headers = new Set(override ? override.split(',').map((item) => item.trim()).filter(Boolean) : []);
  headers.add(headerName);
  response.headers.set('x-middleware-request-' + headerName, value);
  response.headers.set('x-middleware-override-headers', Array.from(headers).join(','));
}

function attachAccessHeaders(response: NextResponse, accessToken: string) {
  if (!accessToken) return;
  setRequestHeader(response, 'x-ev-access', accessToken);
  const [, payload] = accessToken.split('.');
  if (payload) {
    setRequestHeader(response, 'x-ev-session', payload);
  }
}

async function requestTokenPair(req: NextRequest): Promise<TokenPair> {
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value;
  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const response = await fetch(REFRESH_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const error = new Error(`Refresh failed with status ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const data = await response.json() as TokenPair;
  const [, sessionInfo] = data.accessToken.split('.');

  if (sessionInfo) {
    const encrypted = await encrypt(sessionInfo);
    data.sessionCookieValue = Buffer.from(JSON.stringify(encrypted)).toString('base64');
  }

  data.previousRefreshToken = refreshToken;
  return data;
}

type MiddlewareOptions = {
  shouldRefresh: (req: NextRequest) => boolean;
  fetchTokenPair: (req: NextRequest) => Promise<TokenPair>;
  onSuccess: (res: NextResponse, tokenPair: TokenPair) => void;
  onError?: (req: NextRequest, res: NextResponse, error: unknown) => NextResponse | void;
};

type MiddlewareHandler = (req: NextRequest, res: NextResponse, event: NextFetchEvent) => Promise<NextResponse> | NextResponse;

const createMiddleware = getMiddleware as unknown as (options: MiddlewareOptions) => (middleware?: MiddlewareHandler) => MiddlewareHandler;

export const withRefreshToken = createMiddleware({
  shouldRefresh: (req: NextRequest) => {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value;
    if (!refreshToken) {
      return false;
    }

    const key = resolveCacheKey(refreshToken);
    if (!key) {
      return true;
    }

    const entry = cache.get(key);
    if (!entry) {
      return true;
    }

    return entry.exp - Date.now() <= EXPIRY_MARGIN_MS;
  },
  fetchTokenPair: requestTokenPair,
  onSuccess: (response: NextResponse, tokenPair: TokenPair) => {
    const {
      accessToken,
      refreshToken,
      refreshTokenExpiry,
      accessTokenExpiry,
      sessionCookieValue,
      previousRefreshToken,
    } = tokenPair;

    const newKey = resolveCacheKey(refreshToken);
    if (newKey) {
      cache.set(newKey, {
        token: accessToken,
        exp: computeExpiry(accessTokenExpiry),
      });
    }

    if (previousRefreshToken) {
      const previousKey = resolveCacheKey(previousRefreshToken);
      if (previousKey && previousKey !== newKey) {
        cache.delete(previousKey);
      }
    }

    response.cookies.set({
      name: REFRESH_TOKEN_COOKIE_KEY,
      value: refreshToken,
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      ...(isProd ? { domain: '.everlastingvendetta.com' } : {}),
      expires: new Date(refreshTokenExpiry * 1000),
    });

    if (sessionCookieValue) {
      response.cookies.set({
        name: SESSION_INFO_COOKIE_KEY,
        value: sessionCookieValue,
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
        ...(isProd ? { domain: '.everlastingvendetta.com' } : {}),
        expires: new Date(accessTokenExpiry * 1000),
      });
    }

    attachAccessHeaders(response, accessToken);
  },
  onError: (req: NextRequest, res: NextResponse, error: unknown) => {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value;
    if (refreshToken) {
      const key = resolveCacheKey(refreshToken);
      if (key) {
        cache.delete(key);
      }
    }

    const status = (error as { status?: number })?.status;
    if (status === 401) {
      res.cookies.delete(REFRESH_TOKEN_COOKIE_KEY);
      res.cookies.delete(SESSION_INFO_COOKIE_KEY);
    }

    console.error('Refresh token middleware failed', error);
    return res;
  },
});

export function attachCachedAccessToken(response: NextResponse, refreshToken: string | undefined) {
  if (!refreshToken) {
    return;
  }

  const key = resolveCacheKey(refreshToken);
  if (!key) {
    return;
  }

  const entry = cache.get(key);
  if (!entry || entry.exp - Date.now() <= EXPIRY_MARGIN_MS) {
    return;
  }

  attachAccessHeaders(response, entry.token);
}
