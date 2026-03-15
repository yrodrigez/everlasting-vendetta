import { Card, CardBody, CardHeader } from "@/components/card";
import { WebEventsRepository } from "../web-events.repository";
import UserWorldMap from "../components/UserWorldMap";

interface Props {
    repository: WebEventsRepository;
}

export default async function GeoSection({ repository }: Props) {
    const geoData = await repository.getGeoDistribution();

    return (
        <Card className="bg-dark border border-dark-100 p-4">
            <CardHeader>
                <h2 className="text-xl font-bold text-gray-400">User Locations</h2>
            </CardHeader>
            <CardBody>
                <UserWorldMap data={geoData} />
            </CardBody>
        </Card>
    );
}
