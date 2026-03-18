'use client'
import { createContext, useContext, useEffect, useRef } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@/context/AuthContext';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
    const { accessToken } = useAuth();
    const tokenRef = useRef<string | null>(null);
    tokenRef.current = accessToken;

    const clientRef = useRef<SupabaseClient | null>(null);
    if (!clientRef.current) {
        clientRef.current = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { accessToken: async () => tokenRef.current }
        );
    }

    useEffect(() => {
        if (accessToken && clientRef.current) {
            clientRef.current.realtime.setAuth(accessToken);
            clientRef.current.functions.setAuth(accessToken);
        }
    }, [accessToken]);

    return (
        <SupabaseContext.Provider value={clientRef.current}>
            {children}
        </SupabaseContext.Provider>
    );
}

export function useSupabase(): SupabaseClient {
    const client = useContext(SupabaseContext);
    if (!client) throw new Error('useSupabase must be used within SupabaseProvider');
    return client;
}

/**
 * Creates a channel, removing any existing channel with the same name first
 * to avoid "mismatch between server and client bindings" errors on remount.
 */
export function safeChannel(supabase: SupabaseClient, name: string) {
    const existing = supabase.getChannels().find(c => c.topic === `realtime:${name}`);
    if (existing) {
        supabase.removeChannel(existing);
    }
    return supabase.channel(name);
}
