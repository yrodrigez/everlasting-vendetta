
export type CharacterLogsResponse = {
    characterData: {
        character: {
            id: number;
            name: string;
            server: {
                name: string;
                slug: string;
                region: {
                    name: string;
                    compactName: string;
                }
            };
            zoneRankings: {
                size: number;
                zone: number;
                metric: string;
                allStars: Array<{
                    rank: number;
                    spec: string;
                    total: number;
                    points: number;
                    partition: number;
                    regionRank: number;
                    serverRank: number;
                    rankPercent: number;
                    rankTooltip: string | null;
                    possiblePoints: number;
                }>;
                rankings: Array<{
                    spec: string;
                    allStars: {
                        rank: number;
                        total: number;
                        points: number;
                        partition: number;
                        regionRank: number;
                        serverRank: number;
                        rankPercent: number;
                        possiblePoints: number;
                    };
                    bestRank: {
                        ilvl: number;
                        spec: number;
                        class: number;
                        rank_id: number;
                        fight_metadata: number;
                        per_second_amount: number;
                    };
                    bestSpec: string;
                    lockedIn: boolean;
                    encounter: {
                        id: number;
                        name: string;
                    };
                    bestAmount: number;
                    totalKills: number;
                    fastestKill: number;
                    rankPercent: number;
                    rankTooltip: string | null;
                    medianPercent: number;
                }>;
                partition: number;
                difficulty: number;
                bestPerformanceAverage: number;
                medianPerformanceAverage: number;
            };
        }
    }
}

export type CharacterLogsData = CharacterLogsResponse['characterData']

export class WarcraftLogsGateway {
    constructor(
        private readonly httpClient: typeof fetch = (input, init) => fetch(input, init),
        private readonly baseUrl: string = 'https://wlogs.everlastingvendetta.com'
    ) { }

    async getCharacterLogs(realmSlug: string, characterName: string, options: { force?: boolean; signal?: AbortSignal } = {}): Promise<CharacterLogsData> {
        try {
            const searchParams = new URLSearchParams()

            if (options.force) {
                searchParams.set('force', 'true')
            }

            const queryString = searchParams.toString()
            const url = `${this.baseUrl}/api/${realmSlug}/${characterName}/logs${queryString ? `?${queryString}` : ''}`
            const response = await this.httpClient(url, { signal: options.signal })
            if (!response.ok) {
                throw new Error(`Failed to fetch logs for ${characterName} - ${realmSlug}: ${response.statusText}`)
            }

            const data = await response.json() as CharacterLogsResponse

            return data.characterData
        } catch (error) {
            console.error('Error fetching character logs:', error)
            throw error
        }
    }
}
