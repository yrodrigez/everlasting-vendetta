export const createRosterMemberRoute = (characterName: string, realmSlug: string) => {
    return `/roster/${encodeURIComponent(characterName.toLowerCase().trim())}-${encodeURIComponent(realmSlug.toLowerCase().trim())}`;
}