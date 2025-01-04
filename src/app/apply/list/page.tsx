import createServerSession from "@utils/supabase/createServerSession";
import {cookies} from "next/headers";
import NotLoggedInView from "@/app/components/NotLoggedInView";
import {Applicants} from "@/app/apply/list/components/Applicants";

export const dynamic = 'force-dynamic'

export default async function Page() {

    const {supabase, auth} = await createServerSession({cookies})

    const user = await auth.getSession()

    if (!user) {
        return <NotLoggedInView/>
    }

    const {
        data,
        error
    } = await supabase.from('ev_application').select('created_at, id, name, message, class, role, status, reviewer:ev_member(character)')
        .returns<{
            created_at: string,
            id: string,
            name: string,
            message: string,
            class: string,
            role: string,
            status: string,
            reviewer: { character: { name: string, avatar: string } }
        }[]>()

    if (error) {
        return <div>Error fetching applications</div>
    }

    return (
        <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold text-gold">Guild Applications</h1>
            <Applicants applicants={data?.map((x: any) => {
                return {
                    ...x,
                    className: x.class,
                    reviewer: x.reviewer?.character
                }
            })}/>
        </div>
    )
}
