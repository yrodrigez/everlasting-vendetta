'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => <div className="min-h-[300px] flex items-center justify-center">Loading...</div>,
});

type Props = {
    bnet: number;
    discord: number;
};

export default function LoginBreakdownChart({ bnet, discord }: Props) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;

    const series = [bnet, discord];
    const options = {
        chart: {
            type: 'donut' as const,
            background: 'transparent',
        },
        labels: ['Battle.net', 'Discord'],
        colors: ['#0074e0', '#7289da'], // battlenet, discord from tailwind
        legend: {
            position: 'bottom' as const,
            labels: { colors: '#DBD2C3' }, // ivory
        },
        dataLabels: {
            enabled: true,
            style: { fontSize: '14px' },
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
                            label: 'Total Logins',
                            color: '#DBD2C3', // ivory
                        },
                    },
                },
            },
        },
    };

    return <ReactApexChart options={options} series={series} type="donut" height={300} />;
}
