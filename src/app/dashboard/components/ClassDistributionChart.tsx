'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const fontColor = '#dbd2c3';

const CLASS_COLORS: Record<string, string> = {
    Warrior: '#C69B6D',
    Paladin: '#F48CBA',
    Hunter: '#AAD372',
    Rogue: '#FFF468',
    Priest: '#FFFFFF',
    Shaman: '#0070DD',
    Mage: '#3FC7EB',
    Warlock: '#8788EE',
    Druid: '#FF7C0A',
};

type Props = {
    data: Record<string, number>;
};

export default function ClassDistributionChart({ data }: Props) {
    const [loading, setLoading] = useState(true);
    useEffect(() => { setLoading(false); }, []);

    const { series, options } = useMemo(() => {
        const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
        const labels = entries.map(([name]) => name);
        const series = entries.map(([, count]) => count);
        const colors = labels.map(name => CLASS_COLORS[name] ?? '#888888');

        const options = {
            chart: {
                type: 'donut' as const,
                background: 'transparent',
            },
            labels,
            colors,
            legend: {
                position: 'bottom' as const,
                labels: { colors: fontColor },
            },
            dataLabels: {
                enabled: true,
                style: { fontSize: '12px' },
            },
            tooltip: { theme: 'dark' as const },
            stroke: {
                colors: ['#1a1a2e'],
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
                                color: fontColor,
                            },
                        },
                    },
                },
            },
        };
        return { series, options };
    }, [data]);

    if (loading) return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;
    if (series.length === 0) return <div className="min-h-[300px] flex items-center justify-center text-gray-400">No data</div>;

    return <ReactApexChart options={options} series={series} type="donut" height={300} />;
}
