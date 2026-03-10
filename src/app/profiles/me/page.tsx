import NotLoggedInView from "@/components/NotLoggedInView";
import createServerSession from '@/util/supabase/createServerSession';
import ProfilePage from "./profile-page";

export default async function Page({ }) {
    const { auth, apiService } = await createServerSession();
    const session = await auth.getSession();



    if (!session) {
        return <NotLoggedInView />;
    }

    const data = await apiService?.auth.getMyProfile();

    return (
        <ProfilePage
            accounts={data?.accounts.map((x: any) => {
                return {
                    id: x.id,
                    provider: x.provider,
                    username: x.providerUsername,
                    createdAt: x.createdAt,
                    lastSyncAt: x.lastSyncAt,
                    metadata: x.metadata,
                }
            }).sort((a: any, b: any) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA;
            }) ?? []}
            characters={data?.members.filter((x: any) => x.character.level > 9).sort((a: any, b: any) => {
                const lvl = b.character.level - a.character.level
                const name = a.character.name.localeCompare(b.character.name);
                if (lvl !== 0) return lvl;
                return name;
            }).map((x: any) => {
                return {
                    id: x.character.id,
                    avatar: x.character.avatar,
                    name: x.character.name,
                    className: x.character.character_class.name,
                    level: x.character.level,
                    realm: x.character.realm,
                }
            })}
        />
    )
}
