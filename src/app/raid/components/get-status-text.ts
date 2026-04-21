export function getSubscriptionStatusText(status: 'confirmed' | 'declined' | 'tentative' | 'late' | 'unknown' | 'bench') {
    switch (status) {
        case 'confirmed':
            return 'Confirmed'
        case 'declined':
            return 'Can\'t come'
        case 'tentative':
            return 'Tentative'
        case 'late':
            return 'Late'
        case 'bench':
            return 'Benched'
        default:
            return 'Unknown'
    }
}