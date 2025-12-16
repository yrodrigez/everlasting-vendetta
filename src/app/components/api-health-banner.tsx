'use client';

import { useApiHealth } from '@/app/hooks/api/use-api-health';
import { Button } from './Button';
import { CloudAlert, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuthManagerWindowStore } from '../stores/auth-manager-window-store';

export function ApiHealthBanner() {
    const [retries, setRetries] = useState(0);
    const { isHealthy, recheck, isChecking } = useApiHealth();
    useEffect(() => {
        if (!isHealthy && !isChecking) {
            setRetries((prev) => prev + 1);
        }

        if (isHealthy) {
            setRetries(0);
        }
    }, [isHealthy, isChecking]);
    const { isOpen, onClose } = useAuthManagerWindowStore()
    useEffect(() => {
        if (!isHealthy && isOpen) {
            onClose();
        }
    }, [isHealthy, isOpen, onClose]);


    if (isHealthy) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-700 text-white shadow-2xl animate-in slide-in-from-top shadow-red-900">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4 min-h-20">
                <div className="flex items-center gap-2">
                    <span className="text-xl text-yellow-300 animate-pulse"><CloudAlert /></span>
                    <div className="text-sm">
                        <p className="font-bold">The server is unavailable</p>
                        <p className="text-xs opacity-90">Retrying automatically...</p>
                        <p className="text-xs opacity-90">Attempts: {retries}</p>
                    </div>
                </div>
                <Button
                    onPress={() => recheck()}
                    className="text-white text-xs bg-transparent border-none"
                    size="sm"
                    isIconOnly
                >
                    <RotateCcw
                        className={isChecking ? 'animate-[spin_2s_linear_infinite_reverse]' : ''}
                    />
                </Button>
            </div>
        </div>
    );
}