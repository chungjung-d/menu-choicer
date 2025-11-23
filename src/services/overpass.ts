import { Restaurant } from '../data/restaurants';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

const CACHE_KEY_PREFIX = 'lunch_roulette_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
    timestamp: number;
    data: Restaurant[];
}

function getCache(keySuffix: string): Restaurant[] | null {
    try {
        const key = `${CACHE_KEY_PREFIX}${keySuffix}`;
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const entry: CacheEntry = JSON.parse(cached);
        const now = Date.now();

        if (now - entry.timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }

        return entry.data;
    } catch (e) {
        console.warn('Failed to read from cache', e);
        return null;
    }
}

function setCache(keySuffix: string, data: Restaurant[]) {
    try {
        const key = `${CACHE_KEY_PREFIX}${keySuffix}`;
        const entry: CacheEntry = {
            timestamp: Date.now(),
            data
        };
        localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
        console.warn('Failed to write to cache', e);
    }
}

export async function fetchRestaurantsFromOverpass(radius: number, center: { lat: number; lng: number }): Promise<Restaurant[]> {
    // Check cache first (include center in key to avoid using wrong cache)
    // Simple cache key based on lat/lng rounded to 3 decimal places to avoid cache misses on tiny moves
    const cacheKey = `${radius}_${center.lat.toFixed(3)}_${center.lng.toFixed(3)}`;
    const cachedData = getCache(cacheKey);

    if (cachedData) {
        console.log(`Using cached data for ${cacheKey}`);
        return cachedData;
    }

    const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radius},${center.lat},${center.lng});
      node["amenity"="cafe"](around:${radius},${center.lat},${center.lng});
      node["amenity"="fast_food"](around:${radius},${center.lat},${center.lng});
    );
    out body;
    >;
    out skel qt;
  `;

    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: query,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data from Overpass API');
        }

        const data = await response.json();

        const results = data.elements.map((element: any) => {
            const lat = element.lat;
            const lng = element.lon;

            // Calculate distance from center (Haversine formula approximation)
            const R = 6371e3; // metres
            const φ1 = center.lat * Math.PI / 180;
            const φ2 = lat * Math.PI / 180;
            const Δφ = (lat - center.lat) * Math.PI / 180;
            const Δλ = (lng - center.lng) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // in meters

            return {
                id: element.id.toString(),
                name: element.tags.name || 'Unknown Restaurant',
                category: element.tags.cuisine || element.tags.amenity || 'Restaurant',
                lat: lat,
                lng: lng,
                distance: Math.round(distance),
                time: Math.round(distance / 80), // Approx 80m/min walking speed
                rating: Number((3 + Math.random() * 2).toFixed(1)) // Random rating 3.0 - 5.0
            };
        }).filter((r: Restaurant) => r.name !== 'Unknown Restaurant'); // Filter out unnamed places

        // Save to cache
        if (results.length > 0) {
            setCache(cacheKey, results);
        }

        return results;

    } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
    }
}
