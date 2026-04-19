import moment from "moment";
import RaidResetsRepository, { RaidResetRow } from "./raid-resets.repository";

export class CalendarService {
    private readonly normalizePage = (page: string | number): number => {
        const n = typeof page === 'string' ? parseInt(page, 10) : page;
        if (typeof n !== 'number' || isNaN(n) || n < 0) {
            return 0;
        }

        return Math.floor(n);
    }

    public readonly MAX_RAID_RESETS = 9
    public readonly EXPIRATION_HOURS = 8
    public readonly DEFAULT_RAID_TIME = '20:30'

    constructor(private readonly raidResetsRepository: RaidResetsRepository) { }

    private readonly isRaidExpired = (raid_date: string, time?: string | null): boolean => {
        return moment(`${raid_date}T${time || this.DEFAULT_RAID_TIME}`)
            .add(this.EXPIRATION_HOURS, 'hours')
            .isBefore(moment());
    }

    async fetchCalendarPage(page: string | number) {
        const normalizedPage = this.normalizePage(page);
        // Safe cutoff: any raid_date before this is DEFINITELY expired (even with time 23:59 + 8h)
        const safeCutoff = moment().subtract(2, 'days').format('YYYY-MM-DD')
        const { recentRaids, oldExpiredCount, error } = await this.raidResetsRepository.getRecentAndFutureRaids(safeCutoff)

        if (error) {
            console.error('Error fetching recent raids: ' + JSON.stringify(error))
            return { raidResets: [] as RaidResetRow[], totalPages: 1, currentPage: 1 }
        }

        const activeRaids = recentRaids.filter(r => !this.isRaidExpired(r.raid_date, r.time))
        const recentlyExpired = recentRaids.filter(r => this.isRaidExpired(r.raid_date, r.time))
        const totalExpired = oldExpiredCount + recentlyExpired.length
        const totalPastPages = totalExpired > 0 ? Math.ceil(totalExpired / this.MAX_RAID_RESETS) : 0
        const totalPages = Math.max(1, totalPastPages + 1) // last page is always the active page
        const currentPage = normalizedPage === 0 ? totalPages : Math.min(Math.max(1, normalizedPage), totalPages)

        // === Active page (last page) ===
        if (currentPage === totalPages) {
            return {
                raidResets: activeRaids.sort((a, b) => moment(a.raid_date).diff(moment(b.raid_date))),
                totalPages,
                currentPage,
            }
        }

        // === Past page: paginate expired raids ===
        // Virtual list ASC (oldest=0, newest=totalExpired-1): [oldExpired..., recentlyExpired...]
        // Last past page (totalPastPages, closest to active) is always full (maxRaidResets).
        // Page 1 (oldest) may have fewer items (the remainder).
        const ascEnd = totalExpired - (totalPastPages - currentPage) * this.MAX_RAID_RESETS - 1
        const ascStart = Math.max(0, ascEnd - this.MAX_RAID_RESETS + 1)

        let pageRaids: RaidResetRow[] = []

        if (ascEnd < oldExpiredCount) {
            // Entire page from DB (all definitely old expired)
            // DB is ordered DESC: DESC index i = ASC index (oldExpiredCount - 1 - i)
            const dbRangeStart = oldExpiredCount - 1 - ascEnd
            const dbRangeEnd = oldExpiredCount - 1 - ascStart
            const { data, error } = await this.raidResetsRepository.getRaidsInRange(safeCutoff, { start: dbRangeStart, end: dbRangeEnd })

            if (error) {
                console.error('Error fetching past raids: ' + JSON.stringify(error))
                return { raidResets: [], totalPages, currentPage }
            }
            pageRaids = (data || []).sort((a, b) => moment(a.raid_date).diff(moment(b.raid_date)))
        } else if (ascStart >= oldExpiredCount) {
            // Entire page from recentlyExpired (in memory, already ASC)
            const memStart = ascStart - oldExpiredCount
            const memEnd = ascEnd - oldExpiredCount
            pageRaids = recentlyExpired.slice(memStart, memEnd + 1)
        } else {
            // Boundary: tail of old expired from DB + head of recentlyExpired from memory
            // DB part: ASC indices [ascStart, oldExpiredCount - 1]
            const dbRangeStart = 0 // most recent of the old expired (DESC index 0)
            const dbRangeEnd = oldExpiredCount - 1 - ascStart
            const { data, error } = await this.raidResetsRepository.getRaidsInRange(safeCutoff, { start: dbRangeStart, end: dbRangeEnd })

            if (error) {
                console.error('Error fetching past raids: ' + JSON.stringify(error))
                return { raidResets: [], totalPages, currentPage }
            }
            const fromDb = (data || []).sort((a, b) => moment(a.raid_date).diff(moment(b.raid_date)))
            // Memory part: ASC indices [oldExpiredCount, ascEnd]
            const memEnd = ascEnd - oldExpiredCount
            const fromMem = recentlyExpired.slice(0, memEnd + 1)
            pageRaids = [...fromDb, ...fromMem]
        }

        return {
            raidResets: pageRaids,
            totalPages,
            currentPage,
        }
    }
}