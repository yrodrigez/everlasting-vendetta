import createServerSession from "@/util/supabase/createServerSession";
import moment from "moment";
import { Metadata } from "next";
import { RaidResetViewDIContainer } from "../raid-reset-view-di.container";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {

    const { id: raidId } = await params
    // Fetch the raid data based on the ID
    const { getSupabase } = await createServerSession();
    const supabase = await getSupabase();
    const { raidResetViewService } = new RaidResetViewDIContainer(supabase);

    const { data, error } = await raidResetViewService.getResetByResetId(raidId);

    if (error) {
        return {
            title: 'Raid Not Found | Everlasting Vendetta',
            description: 'The raid you are looking for does not exist or cannot be found.',
        };
    }

    const { raid, raid_date: raidDate, time: raidTime, end_date } = data;
    const { name: raidName, image } = raid;

    const raidStartDate = moment(raidDate).format('MMMM D, YYYY');
    const raidEndDate = moment(end_date).format('MMMM D, YYYY');

    const title = `${raidName} Raid - ${raidStartDate} | Everlasting Vendetta`
    const description = `Join the ${raidName} raid starting on ${raidStartDate} at ${raidTime}. Participate in epic battles and secure your loot until ${raidEndDate}.`
    const keywords = `wow, world of warcraft, raid, raiding, pve, pvp, guild, guild events, loot, soft reservations, ${raidName}, ${raidStartDate}`
    const metadataBase = new URL('/raid/' + raidId, process.env.NEXT_PUBLIC_BASE_URL)
    const metadataImage = new URL(`/${image}`, metadataBase).toString()

    return {
        title,
        description,
        keywords,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: metadataImage,
                    width: 600,
                    height: 400,
                    alt: 'Everlasting Vendetta Raid',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: metadataImage,
        }
    };
}