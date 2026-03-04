'use client'
import { createAPIService } from "@/app/lib/api";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function usePageEvent(pageName: string, metadata?: Record<string, any>) {
    const pathname = usePathname();
    const hasFired = useRef(false);
    const api = createAPIService();
    useEffect(() => {
        if (hasFired.current) return;
        hasFired.current = true;

        api.analytics.sendEvent({
            event_name: `page_view_${pageName}`,
            event_type: 'page_view',
            page_path: pathname,
            page_url: window.location.href,
            referrer: document.referrer || undefined,
            metadata,
        });
    }, []);
}

export function sendActionEvent(eventName: string, metadata?: Record<string, any>) {
    const api = createAPIService();
    api.analytics.sendEvent({
        event_name: eventName,
        event_type: 'action',
        page_path: window.location.pathname,
        page_url: window.location.href,
        metadata,
    });
}

export function PageEvent({ name, metadata }: { name: string, metadata?: Record<string, any> }) {
    usePageEvent(name, metadata);
    return null;
}
