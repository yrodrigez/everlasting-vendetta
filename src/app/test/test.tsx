import {TDModelViewer} from "@/app/test/TDModelViewer";

export default async function Page() {
    const items = await Promise.all([
        [1, 215161], // Head https://www.wowhead.com/classic/item=215161/tempered-interference-negating-helmet
        [3, 220738], // Shoulder
        [5, 220653], // Chest
        [6, 215380], // Waist
        [7, 220654], // Legs
        [8, 220656], // Feet
        [9, 19580], // Wrist
        [10, 220541], // Hands
        [15, 213307], // Cloak
        [16, 220583], // Main hand
        [17, 220600] // Off hand
    ].map(async ([slot, id]) => {
        const response = await fetch(`http://localhost:3000/api/v1/bypass/displayId/${id}`);
        if (!response.ok) {
            return [slot, 0];
        }
        const {displayId} = await response.json();

        return [slot, +displayId];
    }));

    return <div id="model_3d">
        <TDModelViewer items={items}/>
    </div>
}
