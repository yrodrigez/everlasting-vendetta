export function groupEventsByDay(events: { created_at: string }[]): { date: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const event of events) {
        const date = event.created_at.split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
    }
    return Object.entries(counts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function countUniqueUsersByDay(events: { created_at: string; user_id: string }[]): { date: string; count: number }[] {
    const usersByDay: Record<string, Set<string>> = {};
    for (const event of events) {
        const date = event.created_at.split('T')[0];
        if (!usersByDay[date]) usersByDay[date] = new Set();
        usersByDay[date].add(event.user_id);
    }
    return Object.entries(usersByDay)
        .map(([date, users]) => ({ date, count: users.size }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTopUsers(events: { user_id: string }[], limit: number): { userId: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const event of events) {
        counts[event.user_id] = (counts[event.user_id] || 0) + 1;
    }
    return Object.entries(counts)
        .map(([userId, count]) => ({ userId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export function groupEventsByDayAndName(
    events: { created_at: string; event_name: string }[]
): Record<string, { date: string; count: number }[]> {
    const grouped: Record<string, Record<string, number>> = {};
    for (const event of events) {
        const date = event.created_at.split('T')[0];
        if (!grouped[event.event_name]) grouped[event.event_name] = {};
        grouped[event.event_name][date] = (grouped[event.event_name][date] || 0) + 1;
    }
    const result: Record<string, { date: string; count: number }[]> = {};
    for (const [name, dates] of Object.entries(grouped)) {
        result[name] = Object.entries(dates)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    return result;
}
