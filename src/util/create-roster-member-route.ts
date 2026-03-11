export const createRosterMemberRoute = (characterName: string, realmSlug: string) => {
    return `/roster/${encodeURIComponent(realmSlug.toLowerCase().trim())}/${encodeURIComponent(characterName.toLowerCase().trim())}`;
}