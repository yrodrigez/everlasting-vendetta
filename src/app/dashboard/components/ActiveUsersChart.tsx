'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="min-h-[300px] flex items-center justify-center">Loading...</div>,
});

// Theme colors from tailwind config
const colors = {
    wood100: '#5f5a53',   // wood-100 — muted text
    dark100: '#1d383b',   // dark-100 — borders/grid
    gold: '#C9A866',      // gold — primary accent / raid days
    gold100: '#E5CC80',   // gold-100 — lighter gold
    moss: '#3E5C4F',      // moss — secondary accent
    moss100: '#5C7A6A',   // moss-100 — weekend highlight
    ivory: '#DBD2C3',     // ivory — primary text
    stone: '#797467',     // stone — default markers
};

type Props = {
    data: { date: string; count: number }[];
    raidSchedule: Record<string, string[]>;
};

export default function ActiveUsersChart({ data, raidSchedule }: Props) {
    const [mounted, setMounted] = useState(false);
    const [pingPositions, setPingPositions] = useState<{ x: number; y: number }[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const updatePingPositions = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const svg = container.querySelector('svg');
        if (!svg) return;

        // ApexCharts renders markers as <path class="apexcharts-marker" fill="..." cx="..." cy="...">
        const raidMarkers = svg.querySelectorAll(`path.apexcharts-marker[fill="${colors.gold}"]`);
        const containerRect = container.getBoundingClientRect();
        const positions: { x: number; y: number }[] = [];

        raidMarkers.forEach((el) => {
            // Use getBoundingClientRect for accurate screen position, then make relative to container
            const rect = el.getBoundingClientRect();
            const x = rect.left + rect.width / 2 - containerRect.left;
            const y = rect.top + rect.height / 2 - containerRect.top;
            positions.push({ x, y });
        });

        setPingPositions(positions);
    }, [data, raidSchedule]);

    useEffect(() => {
        if (!mounted) return;
        // Wait for ApexCharts to finish rendering
        const timer = setTimeout(updatePingPositions, 600);
        return () => clearTimeout(timer);
    }, [mounted, updatePingPositions]);

    if (!mounted || data.length === 0) {
        return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;
    }

    const categories = data.map(d => d.date);
    const series = [{ name: 'Active Users', data: data.map(d => d.count) }];

    // Color each x-axis label by day type
    const labelColors = categories.map((dateStr) => {
        if (raidSchedule[dateStr]) return colors.gold;
        const day = new Date(dateStr + 'T00:00:00').getDay();
        if (day === 0 || day === 6) return colors.moss100;
        return colors.wood100;
    });

    // Color each data point marker by day type
    const discreteMarkers = categories.map((dateStr, index) => {
        const hasRaid = !!raidSchedule[dateStr];
        const day = new Date(dateStr + 'T00:00:00').getDay();
        const isWeekend = day === 0 || day === 6;
        if (!hasRaid && !isWeekend) return null;
        return {
            seriesIndex: 0,
            dataPointIndex: index,
            fillColor: hasRaid ? colors.gold : colors.moss100,
            strokeColor: hasRaid ? colors.gold100 : colors.moss,
            size: hasRaid ? 6 : 4,
        };
    }).filter((m): m is NonNullable<typeof m> => m !== null);

    const options = {
        chart: {
            type: 'line' as const,
            height: 300,
            toolbar: { show: false },
            background: 'transparent',
        },
        stroke: { curve: 'smooth' as const, width: 3 },
        colors: [colors.gold],
        markers: {
            size: 3,
            colors: [colors.stone],
            strokeColors: [colors.stone],
            strokeWidth: 0,
            discrete: discreteMarkers,
        },
        xaxis: {
            categories,
            labels: {
                style: { colors: labelColors, fontSize: '11px' },
                rotate: -45,
                rotateAlways: true,
                formatter: (val: string) => {
                    const date = new Date(val + 'T00:00:00');
                    const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
                    return `${dayShort} ${val?.slice?.(5)}`;
                },
            },
        },
        yaxis: {
            labels: { style: { colors: colors.wood100 } },
            title: { text: 'Users', style: { color: colors.wood100 } },
        },
        grid: { borderColor: colors.dark100 },
        tooltip: {
            theme: 'dark' as const,
            x: {
                formatter: (_val: number, opts: { dataPointIndex: number }) => {
                    const dateStr = categories[opts.dataPointIndex];
                    const date = new Date(dateStr + 'T00:00:00');
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    const day = date.getDay();
                    const raids = raidSchedule[dateStr];
                    if (raids?.length) return `${dayName}, ${dateStr} — ${raids.join(', ')}`;
                    const isWeekend = day === 0 || day === 6;
                    return `${dayName}, ${dateStr}${isWeekend ? ' (Weekend)' : ''}`;
                },
            },
        },
        legend: { show: false },
    };

    return (
        <div ref={containerRef} className="relative">
            <ReactApexChart key={data.length} options={options} series={series} type="line" height={300} />
            {/* Ping overlays on raid day markers */}
            {pingPositions.map((pos, i) => (
                <div
                    key={i}
                    className="absolute pointer-events-none"
                    style={{
                        left: pos.x - 6,
                        top: pos.y - 6,
                        width: 12,
                        height: 12,
                    }}
                >
                    <div className="absolute inset-0 rounded-full bg-gold animate-ping" />
                </div>
            ))}
        </div>
    );
}
