'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const fontColor = '#dbd2c3';

type Props = {
    refreshData: { date: string; count: number }[];
    revokeData: { date: string; count: number }[];
};

export default function SessionActivityChart({ refreshData, revokeData }: Props) {
    const [loading, setLoading] = useState(true);
    useEffect(() => { setLoading(false); }, []);

    const { series, options } = useMemo(() => {
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
            colors: ['#22c55e', '#ef4444'],
            fill: {
                type: 'gradient' as const,
                gradient: { opacityFrom: 0.4, opacityTo: 0.05 },
            },
            xaxis: {
                categories: allDates,
                labels: {
                    style: { colors: fontColor, fontSize: '11px' },
                    rotate: -45,
                    rotateAlways: allDates.length > 14,
                },
                tickAmount: Math.min(allDates.length, 10),
            },
            yaxis: {
                labels: { style: { colors: fontColor } },
            },
            grid: { borderColor: '#333' },
            tooltip: { theme: 'dark' as const },
            legend: {
                position: 'top' as const,
                labels: { colors: fontColor },
            },
        };

        return { series, options };
    }, [refreshData, revokeData]);

    if (loading) return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;

    return <ReactApexChart options={options} series={series} type="area" height={300} />;
}
