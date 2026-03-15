'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="min-h-[300px] flex items-center justify-center">Loading...</div>,
});

// WoW class colors from tailwind config
const CLASS_COLORS: Record<string, string> = {
    Warrior: '#C79C6E',
    Paladin: '#F58CBA',
    Hunter: '#ABD473',
    Rogue: '#FFF569',
    Priest: '#FFFFFF',
    Shaman: '#0070DE',
    Mage: '#40C7EB',
    Warlock: '#8787ED',
    Druid: '#FF7D0A',
};

type Props = {
    data: Record<string, number>;
};

export default function ClassDistributionChart({ data }: Props) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;

    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([name]) => name);
    const series = entries.map(([, count]) => count);
    const chartColors = labels.map(name => CLASS_COLORS[name] ?? '#797467'); // fallback to stone

    if (series.length === 0) return <div className="min-h-[300px] flex items-center justify-center text-wood-100">No data</div>;

    const options = {
        chart: {
            type: 'donut' as const,
            background: 'transparent',
        },
        labels,
        colors: chartColors,
        legend: {
            position: 'bottom' as const,
            labels: { colors: '#DBD2C3' }, // ivory
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '12px' },
        },
        tooltip: { theme: 'dark' as const },
        stroke: {
            colors: ['#031111'], // dark
            width: 2,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '55%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            color: '#DBD2C3', // ivory
                        },
                    },
                },
            },
        },
    };

    return <ReactApexChart options={options} series={series} type="donut" height={300} />;
}
