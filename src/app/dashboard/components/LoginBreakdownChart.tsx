'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const fontColor = '#dbd2c3';

type Props = {
    bnet: number;
    discord: number;
};

export default function LoginBreakdownChart({ bnet, discord }: Props) {
    const [loading, setLoading] = useState(true);
    useEffect(() => { setLoading(false); }, []);

    const { series, options } = useMemo(() => {
        const series = [bnet, discord];
        const options = {
            chart: {
                type: 'donut' as const,
                background: 'transparent',
            },
            labels: ['Battle.net', 'Discord'],
            colors: ['#148eff', '#5865F2'],
            legend: {
                position: 'bottom' as const,
                labels: { colors: fontColor },
            },
            dataLabels: {
                enabled: true,
                style: { fontSize: '14px' },
            },
            tooltip: { theme: 'dark' as const },
            plotOptions: {
                pie: {
                    donut: {
                        size: '55%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total Logins',
                                color: fontColor,
                            },
                        },
                    },
                },
            },
        };
        return { series, options };
    }, [bnet, discord]);

    if (loading) return <div className="min-h-[300px] flex items-center justify-center">Loading...</div>;

    return <ReactApexChart options={options} series={series} type="donut" height={300} />;
}
