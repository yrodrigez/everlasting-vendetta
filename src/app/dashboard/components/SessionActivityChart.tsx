'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="min-h-[300px] flex items-center justify-center">Loading...</div>,
});

// Theme colors from tailwind config
const colors = {
    wood100: '#5f5a53',
    dark100: '#1d383b',
    gold: '#C9A866',
    moss: '#3E5C4F',
    moss100: '#5C7A6A',
    ivory: '#DBD2C3',
    stone: '#797467',
    ocean: '#1D4851',
};

type Props = {
    refreshData: { date: string; count: number }[];
    revokeData: { date: string; count: number }[];
};

export default function SessionActivityChart({ refreshData, revokeData }: Props) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;
    }

    const allDates = [...new Set([
        ...refreshData.map(d => d.date),
        ...revokeData.map(d => d.date),
    ])].sort();

    const refreshMap = Object.fromEntries(refreshData.map(d => [d.date, d.count]));
    const revokeMap = Object.fromEntries(revokeData.map(d => [d.date, d.count]));

    const series = [
        { name: 'Token Refreshes', data: allDates.map(d => refreshMap[d] || 0) },
        { name: 'Token Revocations', data: allDates.map(d => revokeMap[d] || 0) },
    ];

    const options = {
        chart: {
            type: 'area' as const,
            height: 300,
            toolbar: { show: false },
            background: 'transparent',
        },
        stroke: { curve: 'smooth' as const, width: 2 },
        colors: [colors.moss100, colors.gold],
        fill: {
            type: 'gradient' as const,
            gradient: { opacityFrom: 0.3, opacityTo: 0.05 },
        },
        xaxis: {
            categories: allDates,
            labels: {
                style: { colors: colors.wood100, fontSize: '11px' },
                rotate: -45,
                rotateAlways: allDates.length > 14,
                formatter: (val: string) => {
                    const date = new Date(val + 'T00:00:00');
                    const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
                    return `${dayShort} ${val?.slice?.(5)}`;
                },
            },
            tickAmount: Math.min(allDates.length, 10),
        },
        yaxis: {
            labels: { style: { colors: colors.wood100 } },
        },
        grid: { borderColor: colors.dark100 },
        tooltip: { theme: 'dark' as const },
        legend: {
            position: 'top' as const,
            labels: { colors: colors.ivory },
        },
    };

    return <ReactApexChart options={options} series={series} type="area" height={300} />;
}
