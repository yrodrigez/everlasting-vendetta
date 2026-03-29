import { Card, CardBody, CardHeader } from "@/components/card";

export function CardSkeleton({ height = "h-64" }: { height?: string }) {
    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <div className="h-5 w-40 bg-dark-100 rounded animate-pulse" />
            </CardHeader>
            <CardBody>
                <div className={`${height} w-full bg-dark-100 rounded animate-pulse`} />
            </CardBody>
        </Card>
    );
}

export function ActiveUsersSkeleton() {
    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <div className="h-5 w-40 bg-dark-100 rounded animate-pulse" />
            </CardHeader>
            <CardBody>
                <div className="flex gap-6 mb-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-10 bg-dark-100 rounded animate-pulse mb-1" />
                            <div className="h-6 w-16 bg-dark-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                <div className="h-64 w-full bg-dark-100 rounded animate-pulse" />
            </CardBody>
        </Card>
    );
}

export function TwoColumnSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
        </div>
    );
}
