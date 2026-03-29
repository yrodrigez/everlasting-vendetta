export function getSubscriptionStatusText(status: 'confirmed' | 'declined' | 'tentative' | 'late' | 'unknown') {
    switch (status) {
        case 'confirmed':
            return 'Confirmed'
        case 'declined':
            return 'Can\'t come'
        case 'tentative':
            return 'Tentative'
        case 'late':
            return 'Late'
        default:
            return 'Unknown'
    }

}