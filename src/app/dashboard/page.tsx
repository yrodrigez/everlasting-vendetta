import createServerSession from '@/util/supabase/createServerSession';
import { ROLE } from '@/util/constants';
import { SomethingWentWrong } from '@/components/something-went-wrong';
import NotLoggedInView from '@/components/NotLoggedInView';
import { WebEventsRepository } from './web-events.repository';
import OverviewSection from './sections/OverviewSection';
import ActiveUsersSection from './sections/ActiveUsersSection';
import LoginSection from './sections/LoginSection';
import ClassDistributionSection from './sections/ClassDistributionSection';
import SessionActivitySection from './sections/SessionActivitySection';
import LootSection from './sections/LootSection';
import GeoSection from './sections/GeoSection';
import ActivitySection from './sections/ActivitySection';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { auth, getSupabase } = await createServerSession();
    const session = await auth.getSession();

    if (!session?.id) {
        return (
            <NotLoggedInView />
        )
    }

    if (!session.roles?.includes(ROLE.ADMIN)) {
        return (
            <SomethingWentWrong
                header='Access Denied'
                body={(
                    <p className="text-center">
                        You do not have permission to view this page.
                    </p>
                )}
                footer={(
                    <p className="text-center">
                        Please log in with an account that has access.
                    </p>
                )}
            />
        );
    }

    const supabase = await getSupabase();
    const repository = new WebEventsRepository(supabase);

    return (
        <div className="flex flex-col gap-6 p-4 w-full">
            <h1 className="text-3xl font-bold">Guild Dashboard</h1>
            <OverviewSection repository={repository} />
            <ActiveUsersSection repository={repository} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LoginSection repository={repository} />
                <ClassDistributionSection repository={repository} />
            </div>
            <SessionActivitySection repository={repository} />
            <LootSection repository={repository} />
            <GeoSection repository={repository} />
            <ActivitySection repository={repository} />
        </div>
    );
}
