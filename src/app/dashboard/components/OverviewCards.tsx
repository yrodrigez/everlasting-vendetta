'use client';

import { Card, CardBody, CardHeader } from "@/components/card";

type Props = {
    eventsToday: number;
    events7d: number;
    events30d: number;
    uniqueUsers: number;
    pageViews: number;
};

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <Card className="bg-dark border border-dark-100 min-w-[150px] flex-1">
            <CardHeader>
                <h3 className="text-sm text-gray-400">{title}</h3>
            </CardHeader>
            <CardBody>
                <p className="text-3xl font-bold text-default">{value.toLocaleString()}</p>
            </CardBody>
        </Card>
    );
}

export default function OverviewCards({ eventsToday, events7d, events30d, uniqueUsers, pageViews }: Props) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard title="Events Today" value={eventsToday} />
            <StatCard title="Events (7d)" value={events7d} />
            <StatCard title="Events (30d)" value={events30d} />
            <StatCard title="Unique Users (30d)" value={uniqueUsers} />
            <StatCard title="Page Views (30d)" value={pageViews} />
        </div>
    );
}
