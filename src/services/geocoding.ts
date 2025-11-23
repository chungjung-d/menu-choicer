export interface LocationResult {
    lat: number;
    lng: number;
    address: string;
}

export async function searchAddress(query: string): Promise<LocationResult[]> {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        if (!response.ok) throw new Error('Geocoding failed');

        const data = await response.json();
        return data.map((item: any) => ({
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            address: item.display_name
        }));
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
}
