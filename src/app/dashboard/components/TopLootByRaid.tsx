'use client';

type RaidLootData = {
    raidId: string;
    raidName: string;
    raidImage: string | null;
    top: { character: string; count: number }[];
};

type Props = {
    raids: RaidLootData[];
};

export default function TopLootByRaid({ raids }: Props) {
    if (raids.length === 0) {
        return <div className="min-h-[200px] flex items-center justify-center text-gray-400">No loot data</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {raids.map(raid => (
                <div key={raid.raidId} className="bg-dark-100/40 rounded-lg overflow-hidden border border-dark-100">
                    {raid.raidImage && (
                        <div
                            className="h-20 bg-cover bg-center relative"
                            style={{ backgroundImage: `url(${raid.raidImage})` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent" />
                            <h3 className="absolute bottom-2 left-3 text-sm font-bold text-default drop-shadow-lg">{raid.raidName}</h3>
                        </div>
                    )}
                    {!raid.raidImage && (
                        <div className="px-3 pt-3">
                            <h3 className="text-sm font-bold text-default">{raid.raidName}</h3>
                        </div>
                    )}
                    <div className="p-3">
                        <ol className="space-y-1.5">
                            {raid.top.map((entry, i) => (
                                <li key={entry.character} className="flex items-center gap-2 text-sm">
                                    <span className={`w-5 text-center font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-default flex-1 truncate">{entry.character}</span>
                                    <span className="text-gray-400 font-mono text-xs">{entry.count} items</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            ))}
        </div>
    );
}
