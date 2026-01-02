import crypto from 'crypto';
import { encrypt } from '@/app/util/auth/crypto';
import { REFRESH_TOKEN_COOKIE_KEY, SESSION_INFO_COOKIE_KEY } from '@/app/util/constants';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';
import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

const isProd = process.env.NODE_ENV === 'production';
const REFRESH_ENDPOINT = `${process.env.NEXT_PUBLIC_EV_API_URL}/auth/refresh`;
const EXPIRY_MARGIN_MS = 60_000;


function applyCookiesOnNextResponse(req: NextRequest, res: NextResponse) {
  const outgoingCookies = new ResponseCookies(res.headers);
  const incomingHeaders = new Headers(req.headers);
  const incomingCookies = new RequestCookies(incomingHeaders);

  outgoingCookies.getAll().forEach((cookie) => incomingCookies.set(cookie));

  const accessHeader = res.headers.get('x-ev-access') ?? res.headers.get('x-middleware-request-x-ev-access');
  const sessionHeader = res.headers.get('x-ev-session') ?? res.headers.get('x-middleware-request-x-ev-session');
  if (accessHeader) {
    incomingHeaders.set('x-ev-access', accessHeader);
  } else {
    console.log('No x-ev-access header to set on request');
  }
  if (sessionHeader) {
    incomingHeaders.set('x-ev-session', sessionHeader);
  } else {
    console.log('No x-ev-session header to set on request');
  }

  const nextResponseHeaders = NextResponse.next({
    request: { headers: incomingHeaders },
  }).headers;

  nextResponseHeaders.forEach((value, key) => {
    if (
      key === 'x-middleware-override-headers' ||
      key.startsWith('x-middleware-request-') ||
      key.indexOf('x-ev-') !== -1
    ) {
      res.headers.set(key, value);
    }
  });
}

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

type MiddlewareHandler = (req: NextRequest, res: NextResponse, event?: NextFetchEvent) => Promise<NextResponse> | NextResponse;
type ProxyHandler = (req: NextRequest, event?: NextFetchEvent) => Promise<NextResponse> | NextResponse;

function shouldRefresh(req: NextRequest): boolean {
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
}

function handleSuccess(response: NextResponse, tokenPair: TokenPair) {
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
    sameSite: 'lax',
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
      sameSite: 'lax',
      path: '/',
      ...(isProd ? { domain: '.everlastingvendetta.com' } : {}),
      expires: new Date(accessTokenExpiry * 1000),
    });
  }

  attachAccessHeaders(response, accessToken);
}

function handleError(req: NextRequest, res: NextResponse, error: unknown): NextResponse {
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
}

export function withRefreshToken(middlewareFn?: MiddlewareHandler): ProxyHandler {
  return async (req: NextRequest, event?: NextFetchEvent) => {
    const res = NextResponse.next();
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value;


    if (refreshToken) {
      if (shouldRefresh(req)) {
        try {
          const tokenPair = await requestTokenPair(req);
          handleSuccess(res, tokenPair);
        } catch (error) {
          return handleError(req, res, error);
        }
      } else {
        const key = resolveCacheKey(refreshToken);
        if (key) {
          const entry = cache.get(key);
          if (entry) {
            attachAccessHeaders(res, entry.token);
            console.log('[withRefreshToken] using CACHED token');
          } else {
            console.log('[withRefreshToken] NO cache entry for key');
          }
        } else {
          console.log('[withRefreshToken] could not resolve cache key');
        }
      }
    }

    applyCookiesOnNextResponse(req, res);

    return middlewareFn ? middlewareFn(req, res, event) : res;
  };
}