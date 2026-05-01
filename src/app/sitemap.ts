import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import moment from 'moment'

const BASE_URL = 'https://www.everlastingvendetta.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const safeCutoff = moment().subtract(30, 'days').format('YYYY-MM-DD')

    const { data: raids } = await supabase
        .from('raid_resets')
        .select('id, raid_date')
        .gte('raid_date', safeCutoff)
        .order('raid_date', { ascending: true })

    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/calendar`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/apply`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ]

    const raidPages: MetadataRoute.Sitemap = (raids || []).map((raid) => ({
        url: `${BASE_URL}/raid/${raid.id}`,
        lastModified: new Date(raid.raid_date),
        changeFrequency: 'weekly',
        priority: 0.7,
    }))

    return [...staticPages, ...raidPages]
}