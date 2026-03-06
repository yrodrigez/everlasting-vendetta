'use client';

import moment from 'moment';

type EventRow = {
    event_name: string;
    event_type: string | null;
    user_id: string | null;
    created_at: string;
    page_path: string | null;
};

type Props = {
    events: EventRow[];
};

const typeBadgeColors: Record<string, string> = {
    page_view: 'bg-blue-500/20 text-blue-400',
    action: 'bg-amber-500/20 text-amber-400',
    auth: 'bg-purple-500/20 text-purple-400',
    system: 'bg-gray-500/20 text-gray-400',
};

export default function RecentEventsFeed({ events }: Props) {
    if (events.length === 0) {
        return <p className="text-gray-400">No recent events.</p>;
    }

    return (
        <div className="max-h-[350px] overflow-y-auto scrollbar-pill space-y-2">
            {events.map((event, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-dark-100/50 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${typeBadgeColors[event.event_type ?? ''] ?? typeBadgeColors.system}`}>
                        {event.event_type ?? 'unknown'}
                    </span>
                    <span className="font-medium truncate flex-1 text-default">{event.event_name}</span>
                    {event.user_id && (
                        <span className="text-gray-500 text-xs truncate max-w-[80px]" title={event.user_id}>
                            {event.user_id.slice(0, 8)}...
                        </span>
                    )}
                    <span className="text-gray-500 text-xs whitespace-nowrap">
                        {moment(event.created_at).fromNow()}
                    </span>
                </div>
            ))}
        </div>
    );
}
