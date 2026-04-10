/**
 * Haversine formula to calculate distance between two points in km
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Estimate fuel consumption
 * @param distanceKm Distance in kilometers
 * @param averageKml Average consumption (e.g. 12 km/L)
 */
export function estimateFuel(distanceKm: number, averageKml: number = 12): number {
    if (averageKml <= 0) return 0;
    return distanceKm / averageKml;
}

/**
 * Format time duration in HH:MM:SS
 */
export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
}
