'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { setAccessTokenGetter } from "@/app/lib/axios";
import { setAccessTokenGetter as setAccessTokenApi } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { withRefreshMutex } from "../util/auth/refresh-mutex";

export interface Session {
  id: string;
  provider: 'bnet' | 'discord';
  createdAt: string;
  lastUsedAt: string;
  ipAddress: string;
  userAgent: string;
  isCurrent: boolean;
}

export interface User {
  id: string;
  roles: string[];
  provider: 'bnet_oauth' | 'discord_oauth' | 'temporal';
  permissions: string[];
  isTemporal?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
}

type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

type AuthResult<T> = Result<T, AuthError>;

type AuthError =
  | { type: 'network'; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'expired'; message: string };

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (provider: 'bnet' | 'discord', redirectTo?: string) => void;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<{ accessToken?: string, ok: boolean }>;
  getSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<AuthResult<undefined>>;
}

function jwtDecode(accessToken: string) {
  try {
    const payload = accessToken.split('.')[1]
    return JSON.parse(atob(payload))
  } catch { return {} as any }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout>(null);
  const router = useRouter();

  const REFRESH_THRESHOLD = 60_000; // 60 seconds before expiry

  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
    setAccessTokenApi(() => accessToken);
  }, [accessToken]);

  const refreshToken = useCallback(async () => withRefreshMutex(async (): Promise<{ accessToken?: string, ok: boolean }> => {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) {
      if (res.status === 401) {
        return { ok: false };
      }
      console.error('Token refresh failed', (await res.text()) ?? 'N/A', res.status, res.statusText);
      return { ok: false };
    }

    const { accessToken, redirectTo } = await res.json();

    if (redirectTo) {
      const currentPath = window.location.pathname;
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set('redirectedFrom', currentPath);
      window.location.href = url.toString();
      return { ok: false };
    }
    if (!accessToken) {
      return { ok: false };
    }

    setAccessToken(accessToken);

    const decoded = jwtDecode(accessToken);

    setUser({
      id: decoded.sub,
      roles: decoded.custom_roles,
      provider: decoded.provider,
      permissions: decoded.permissions || [],
      isTemporal: decoded.isTemporal,
      isAdmin: decoded.isAdmin,
      isBanned: decoded.isBanned
    });

    return { ok: true, accessToken };
  }), []);

  useEffect(() => {
    if (!accessToken) return;

    const decoded = jwtDecode(accessToken);
    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshAt = Math.max(0, expiresIn - REFRESH_THRESHOLD);
    console.log(`Token expires in ${Math.round(expiresIn / 1000)}s, scheduling refresh in ${Math.round(refreshAt / 1000)}s`);
    refreshTimerRef.current = setTimeout(() => {
      refreshToken()
    }, refreshAt);

    return () => (refreshTimerRef.current ? clearTimeout(refreshTimerRef.current) : void 0);
  }, [accessToken]);

  useEffect(() => {
    refreshToken().catch(() => {
      setAccessToken(null);
      setUser(null);
    });
  }, [refreshToken]);

  // Listen for auth success messages from OAuth popup windows
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'AUTH_SUCCESS') {
        console.log('Auth success message received, refreshing token...');
        refreshToken().catch((err) => {
          console.error('Failed to refresh token after login:', err);
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshToken]);

  // Listen for auth changes from other tabs/windows
  useEffect(() => {
    const bc = new BroadcastChannel('auth')
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'refreshed') {
        setAccessToken(e.data.accessToken)
        const decoded = jwtDecode(e.data.accessToken)
        setUser({
          id: decoded.sub,
          roles: decoded.custom_roles,
          provider: decoded.provider,
          permissions: decoded.permissions || [],
          isTemporal: decoded.isTemporal,
          isAdmin: decoded.isAdmin,
          isBanned: decoded.isBanned
        })
      }
      if (e.data?.type === 'refresh-failed') {
        setAccessToken(null);
        setUser(null);
      }
    }
    bc.addEventListener('message', onMsg)
    return () => bc.removeEventListener('message', onMsg)
  }, [refreshToken]);



  const logout = useCallback(async () => {
    if (!accessToken) return;

    await fetch('/api/v1/auth/revoke', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    setAccessToken(null);
    setUser(null);
  }, [accessToken, router]);

  const logoutAll = useCallback(async () => {
    if (!accessToken) return;

    await fetch('/api/v1/auth/revoke_all', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    setAccessToken(null);
    setUser(null);
  }, [accessToken, router]);

  const login = useCallback((provider: 'bnet' | 'discord', redirectTo?: string) => {
    const currentPath = redirectTo || window.location.pathname;
    const url = `/api/v1/oauth/${provider}/auth?redirectedFrom=${encodeURIComponent(currentPath)}&windowOpener=true`;

    // Open OAuth in a popup window
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    // Fallback: if popup was blocked, redirect in the current window
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.warn('Popup was blocked, falling back to redirect');
      window.location.href = `/api/v1/oauth/${provider}/auth?redirectedFrom=${encodeURIComponent(currentPath)}`;
    }
  }, [accessToken, router]);

  const getSessions = useCallback(async (): Promise<Session[]> => {
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const res = await fetch('/api/v1/auth/sessions', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const data = await res.json();

    // Map backend response to frontend Session interface
    return data.sessions?.map((session: any) => ({
      id: session.id,
      provider: session.provider,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isCurrent: session.isCurrentSession
    })) || [];
  }, [accessToken]);

  const revokeSession = useCallback(async (sessionId: string): Promise<AuthResult<undefined>> => {
    if (!accessToken) {
      return { success: false, error: { type: 'unauthorized', message: 'Not authenticated' } };
    }

    const res = await fetch('/api/v1/auth/revoke', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token_jti: sessionId })
    });

    if (!res.ok) {
      return { success: false, error: { type: 'network', message: 'Failed to revoke session' } };
    }

    return { success: true, data: undefined };
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{
      accessToken,
      isAuthenticated: !!accessToken,
      user,
      login,
      logout,
      logoutAll,
      refreshToken,
      getSessions,
      revokeSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
