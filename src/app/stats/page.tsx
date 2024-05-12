import {createServerComponentClient} from "@supabase/auth-helpers-nextjs";
import {cookies} from "next/headers";
import Chart from "@/app/stats/Chart";
import {fetchCharacterAvatar} from "@/app/lib/fetchCharacterAvatar";
import {Card, CardBody} from "@nextui-org/react";
import {CardFooter, CardHeader} from "@nextui-org/card";
import Image from "next/image";
import moment from "moment";
import Link from "next/link";

export const dynamic = 'force-dynamic'


type MemberRecord = {
    id: number,
    name: string,
    rank: number,
    class: number,
    level: number
}

export type MemberWithStatistics = {
    leaver: boolean,
    joined: boolean,
    previousRank: string,
    className: string,
    rankName: string,
    classColor: string
    avatar?: string
} & MemberRecord

function getClassNameFromNumber(classNumber: number) {
    switch (classNumber) {
        case 1:
            return 'Warrior';
        case 2:
            return 'Paladin';
        case 3:
            return 'Hunter';
        case 4:
            return 'Rogue';
        case 5:
            return 'Priest';
        case 6:
            return 'Death Knight';
        case 7:
            return 'Shaman';
        case 8:
            return 'Mage';
        case 9:
            return 'Warlock';
        case 10:
            return 'Monk';
        case 11:
            return 'Druid';
        case 12:
            return 'Demon Hunter';
        default:
            return 'Unknown';
    }
}

function getRankNameFromNumber(rankNumber: number) {
    switch (rankNumber) {
        case 0:
            return 'Glorious Leader';
        case 1:
            return 'Resp. Comrade';
        case 2:
            return 'Resp. Comrade';
        case 3:
            return 'Resp. Raider';
        case 4:
            return 'People';
        default:
            return 'Alter';
    }
}

function getClassColor(className: string) {
    switch (className) {
        case 'Warrior':
            return '#C79C6E';
        case 'Paladin':
            return '#F58CBA';
        case 'Hunter':
            return '#ABD473';
        case 'Rogue':
            return '#FFF569';
        case 'Priest':
            return '#FFFFFF';
        case 'Death Knight':
            return '#C41F3B';
        case 'Shaman':
            return '#0070DE';
        case 'Mage':
            return '#69CCF0';
        case 'Warlock':
            return '#9482C9';
        case 'Monk':
            return '#00FF96';
        case 'Druid':
            return '#FF7D0A';
        default:
            return '#000000';
    }

}


export default async function Page() {
    const supabase = createServerComponentClient({cookies});
    const {
        data,
        error
    } = await supabase.from('ev_guild_roster_history').select('members:details, created_at').order('created_at', {ascending: false}).limit(15);

    if (error) {
        console.error('Error fetching guild roster historic', error)
        return <div>Error fetching guild roster history</div>
    }

    const {data: blizzardToken} = await supabase.functions.invoke('everlasting-vendetta', {});
    const token = blizzardToken?.token;

    const lastUpdate = moment(data?.[0]?.created_at).fromNow();

    const latest = data?.slice(0, 7).map((x: any) => x.members).flat() ?? [];
    const historic = data?.slice(1) ?? [];

    const members = await Promise.all([...latest, ...(historic.reduce((acc: any, x: any) => {
        return [...acc, ...x.members]
    }, []))].filter((member: MemberRecord) => member.level > 10).map((member: MemberRecord) => {
        const previousRank = historic.find((h) => h.members.some((m: MemberRecord) => m.id === member.id))?.members.find((m: MemberRecord) => m.id === member.id)?.rank;
        const className = getClassNameFromNumber(member.class);
        const rankName = getRankNameFromNumber(member.rank);
        const classColor = getClassColor(className);

        const leaver = historic.some((h) => h.members.some((m: MemberRecord) => m.id === member.id)) && !latest.some((m: MemberRecord) => m.id === member.id);
        const joined = !historic.some((h) => h.members.some((m: MemberRecord) => m.id === member.id));

        return {
            ...member,
            previousRank,
            className,
            rankName,
            classColor,
            leaver,
            joined
        } as MemberWithStatistics
    }).map(async (member: MemberWithStatistics) => {
        let avatar = '/avatar-anon.png';
        const {data, error} = await supabase.from('ev_member').select('character').eq('id', member.id).single();
        if (error) {
            avatar = await fetchCharacterAvatar(
                token,
                'lone-wolf',
                member.name,
            );
        } else {
            avatar = data.character.avatar;
        }

        return {
            ...member,
            avatar
        }
    }));

    const leavers = members.filter((x: MemberWithStatistics) => x.leaver);
    const joiners = members.filter((x: MemberWithStatistics) => x.joined);
    const latestMembers = members.filter((x: MemberWithStatistics) => !x.leaver && !x.joined);
    return (
        <div
            className="flex flex-col items-center justify-center py-2 h-full w-full"
        >
            <div className="w-full hidden lg:visible">
            <h1 className="text-4xl font-bold">Statistics</h1>
            </div>
            <div
                className="flex gap-2 w-full h-[400px] overflow-y-auto items-center lg:justify-center overflow-x-hidden flex-col lg:flex-row scrollbar-pill snap-y">
                <Card shadow="lg"
                      className="flex flex-col items-center justify-center min-h-[250px] bg-dark border border-dark-100 text-primary min-w-[325px] w-full lg:max-w-[325px] snap-center">
                    <CardHeader>
                        <h1 className={'text-xl font-bold'}>Joiners vs leavers</h1>
                    </CardHeader>
                    <CardBody>
                        <div className={`grid grid-cols-1 gap-2 mb-2`}>
                            <div className={`grid grid-cols-2`}>
                                <h1>Joiners</h1>
                                <h1>{joiners.length}</h1>
                            </div>
                            <div className={`grid grid-cols-2`}>
                                <h1>Leavers</h1>
                                <h1>{leavers.length}</h1>
                            </div>
                        </div>
                        <div className={`scrollbar-pill grid grid-cols-1 gap-2`}>
                            <div className={`grid grid-cols-2`}>
                                <h1>Churn rate</h1>
                                <h1>
                                    {Math.round((leavers.length / (joiners.length + leavers.length)) * 100)}%
                                </h1>
                            </div>
                            <div className={`grid grid-cols-2`}>
                                <h1>Retention rate</h1>
                                <h1>
                                    {Math.round((joiners.length / (joiners.length + leavers.length)) * 100)}%
                                </h1>
                            </div>
                        </div>
                    </CardBody>
                    <CardFooter>
                        <h1>Data from {lastUpdate}</h1>
                    </CardFooter>
                </Card>
                <Card shadow="lg"
                      className="flex flex-col items-center justify-center h-[250px] min-h-[250px] bg-green-500 border border-green-300 w-full text-white min-w-[325px] lg:max-w-[325px] snap-center">
                    <CardHeader>
                        <h1 className={'text-xl font-bold'}>Joiners</h1>
                    </CardHeader>
                    <CardBody className={'scrollbar-pill'}>
                        {joiners.length === 0 && <h1>No new joiners</h1>}
                        <div className={`scrollbar-pill grid grid-cols-1 gap-2`}>
                            {joiners.map((officer: MemberWithStatistics) => (
                                <Link
                                    href={`/roster/${officer.name}`}
                                    target={'_blank'}
                                    key={officer.id} className={`grid grid-cols-2`}>
                                    <Image
                                        width={36}
                                        height={36}
                                        alt={officer.name}
                                        src={officer.avatar || '/avatar-anon.png'}
                                        className="rounded-full w-10 h-10 border border-gold"
                                    />
                                    <h1>{officer.name}</h1>
                                </Link>
                            ))}
                        </div>
                    </CardBody>
                    <CardFooter>
                        <h1>Data from {lastUpdate}</h1>
                    </CardFooter>
                </Card>
                <Card shadow="lg"
                      className={'flex flex-col items-center justify-center h-[250px] min-h-[250px] bg-red-500 border border-red-300 w-full text-white min-w-[325px] lg:max-w-[325px] snap-center'}>
                    <CardHeader>
                        <h1 className={'text-xl font-bold'}>Leavers</h1>
                    </CardHeader>
                    <CardBody className={'scrollbar-pill'}>
                        {leavers.length === 0 && <h1>No new leavers</h1>}
                        <div className={`scrollbar-pill grid grid-cols-1 gap-2`}>
                            {leavers.map((officer: MemberWithStatistics) => (
                                <Link
                                    href={`/roster/${officer.name}`}
                                    target={'_blank'}
                                    key={officer.id} className={`grid grid-cols-2`}>
                                    <Image
                                        width={36}
                                        height={36}
                                        alt={officer.name}
                                        src={officer.avatar || '/avatar-anon.png'}
                                        className="rounded-full w-10 h-10 border border-gold filter grayscale"
                                    />
                                    <h1>{officer.name}</h1>
                                </Link>
                            ))}
                        </div>
                    </CardBody>
                    <CardFooter>
                        <h1>Data from {lastUpdate}</h1>
                    </CardFooter>
                </Card>
            </div>
            <div
                className="flex flex-col w-full h-full"
            >
                <Chart members={latestMembers.filter((x: MemberWithStatistics) => x.level >= 50)}/>
            </div>
        </div>
    )
}
