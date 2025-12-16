'use client';
import { MemberWithStatistics } from "@/app/stats/page";
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from "react-apexcharts";

const fontColor = '#dbd2c3';

export default ({ members }: { members: MemberWithStatistics[] }) => {
    const { series, options } = useMemo(() => {
        const classCounts = members.reduce((acc, member) => {
            acc[member.className] = (acc[member.className] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const categories = Object.keys(classCounts);

        const options = {
            chart: {
                type: 'bar' as const,
                height: 350,
                toolbar: {
                    show: false,
                }
            },
            plotOptions: {
                bar: {
                    distributed: true,
                    columnWidth: '45%',
                    borderRadius: 4,
                    borderRadiusApplication: 'end' as const,
                }
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                categories: categories,
                labels: {
                    style: {
                        colors: categories.map(className => members.find(member => member.className === className)?.classColor || 'black'),
                        fontSize: '14px',
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: fontColor,
                    }
                },
                title: {
                    text: 'Class count (lvl 50)',
                    style: {
                        color: fontColor,
                    }
                }
            },
            legend: {
                show: false,
            },
            tooltip: {
                enabled: false,
            },
            colors: categories.map(className => members.find(member => member.className === className)?.classColor || 'black'),
        };
        const series = [{
            data: Object.values(classCounts)
        }];
        return { series, options };
    }, [members]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(false);
    });
    return (
        <div
            className={`bg-moss border border-stone rounded-lg min-h-[340px] backdrop-filter backdrop-blur-md w-full opacity-90 p-4`}>
            <h1 className="font-bold text-xl">Class Distribution</h1>
            {loading ? <div>Loading...</div> :
                <ReactApexChart options={options} series={series} type="bar" height={350} />}

        </div>
    )
}
