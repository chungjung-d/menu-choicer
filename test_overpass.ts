import { fetchRestaurantsFromOverpass } from './src/services/overpass';

async function test() {
    console.log("Testing Overpass API...");
    try {
        const restaurants = await fetchRestaurantsFromOverpass(400); // 5 min walk radius
        console.log(`Found ${restaurants.length} restaurants.`);
        if (restaurants.length > 0) {
            console.log("First restaurant:", restaurants[0]);
        } else {
            console.log("No restaurants found. Check if the location has data or if the API is reachable.");
        }
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
