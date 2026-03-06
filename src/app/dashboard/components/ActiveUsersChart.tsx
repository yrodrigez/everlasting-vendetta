'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const fontColor = '#dbd2c3';

type Props = {
    data: { date: string; count: number }[];
};

export default function ActiveUsersChart({ data }: Props) {
    const [loading, setLoading] = useState(true);
    useEffect(() => { setLoading(false); }, []);

    const { series, options } = useMemo(() => {
        const categories = data.map(d => d.date);
        const series = [{ name: 'Active Users', data: data.map(d => d.count) }];
        const options = {
            chart: {
                type: 'line' as const,
                height: 300,
                toolbar: { show: false },
                background: 'transparent',
            },
            stroke: { curve: 'smooth' as const, width: 3 },
            colors: ['#8b5cf6'],
            xaxis: {
                categories,
                labels: {
                    style: { colors: fontColor, fontSize: '11px' },
                    rotate: -45,
                    rotateAlways: data.length > 14,
                },
                tickAmount: Math.min(data.length, 10),
            },
            yaxis: {
                labels: { style: { colors: fontColor } },
                title: { text: 'Users', style: { color: fontColor } },
            },
            grid: { borderColor: '#333' },
            tooltip: { theme: 'dark' as const },
            legend: { show: false },
        };
        return { series, options };
    }, [data]);

    if (loading) return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;

    return <ReactApexChart options={options} series={series} type="line" height={300} />;
}
