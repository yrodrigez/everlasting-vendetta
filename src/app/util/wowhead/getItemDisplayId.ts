export async function getItemDisplayId(id: number): Promise<number> {
    const baseUrl = `https://www.wowhead.com/item=${id}`;
    const response = await fetch(baseUrl);
    if (!response.ok) {
        throw new Error(`Error fetching item display id: '${id}', status: ${response.status}`);
    }
    const data = await response.text();

    const regex = /&quot;displayId&quot;\s*:\s*([0-9]+)/
    const match = data.match(regex);
    if (!match) {
        throw new Error(`No match for display id in item: '${id}'`);
    }
    const displayId = match[1];

    return +displayId;
}
