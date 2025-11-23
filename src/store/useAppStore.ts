import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Restaurant, MOCK_RESTAURANTS, CENTER as DEFAULT_CENTER } from '../data/restaurants';
import { fetchRestaurantsFromOverpass } from '../services/overpass';

interface Location {
    lat: number;
    lng: number;
    address: string;
}

interface AppState {
    restaurants: Restaurant[];
    selectedRestaurant: Restaurant | null;
    isSpinning: boolean;
    isZoomed: boolean;
    maxWalkingTime: number; // 5, 10, 15 minutes
    isLoading: boolean;
    center: Location;

    allCategories: string[];
    selectedCategories: string[];

    // Actions
    startRoulette: () => void;
    stopRoulette: (restaurant: Restaurant) => void;
    reset: () => void;
    setMaxWalkingTime: (time: number) => void;
    setCenter: (location: Location) => void;
    toggleCategory: (category: string) => void;
    selectAllCategories: () => void;
    deselectAllCategories: () => void;
    loadRestaurants: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            restaurants: [], // Start empty, load on init
            selectedRestaurant: null,
            isSpinning: false,
            isZoomed: false,
            maxWalkingTime: 10, // Default 10 min
            isLoading: false,
            center: DEFAULT_CENTER,
            allCategories: [],
            selectedCategories: [],

            startRoulette: () => set({ isSpinning: true, isZoomed: false, selectedRestaurant: null }),
            stopRoulette: (restaurant) => set({ isSpinning: false, selectedRestaurant: restaurant, isZoomed: true }),
            reset: () => set({ isSpinning: false, selectedRestaurant: null, isZoomed: false }),

            setMaxWalkingTime: (time) => {
                set({ maxWalkingTime: time });
                get().loadRestaurants();
            },

            setCenter: (location) => {
                set({ center: location, selectedRestaurant: null, isZoomed: false });
                get().loadRestaurants();
            },

            toggleCategory: (category) => {
                const { selectedCategories } = get();
                if (selectedCategories.includes(category)) {
                    set({ selectedCategories: selectedCategories.filter(c => c !== category) });
                } else {
                    set({ selectedCategories: [...selectedCategories, category] });
                }
            },

            selectAllCategories: () => {
                set({ selectedCategories: get().allCategories });
            },

            deselectAllCategories: () => {
                set({ selectedCategories: [] });
            },

            loadRestaurants: async () => {
                set({ isLoading: true });
                const { maxWalkingTime, center } = get();
                const radius = maxWalkingTime * 80; // 80m per minute

                try {
                    const realData = await fetchRestaurantsFromOverpass(radius, center);
                    let finalRestaurants = realData;

                    if (realData.length === 0) {
                        // Fallback to mock data if API fails or returns nothing (filtered by distance)
                        if (Math.abs(center.lat - DEFAULT_CENTER.lat) < 0.01 && Math.abs(center.lng - DEFAULT_CENTER.lng) < 0.01) {
                            finalRestaurants = MOCK_RESTAURANTS.filter(r => r.time <= maxWalkingTime);
                        }
                    }

                    // Extract categories
                    const categories = Array.from(new Set(finalRestaurants.map(r => r.category))).sort();

                    set({
                        restaurants: finalRestaurants,
                        allCategories: categories,
                        // Only reset selected categories if they are empty or if we loaded new data structure
                        // For now, let's select all by default when loading new data
                        selectedCategories: categories,
                        isLoading: false
                    });

                } catch (error) {
                    console.error("Failed to load restaurants", error);
                    set({ restaurants: [], allCategories: [], selectedCategories: [], isLoading: false });
                }
            }
        }),
        {
            name: 'lunch-roulette-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                selectedRestaurant: state.selectedRestaurant,
                maxWalkingTime: state.maxWalkingTime,
                isZoomed: state.selectedRestaurant ? true : false,
                center: state.center,
                // Persist selected categories so user preference is saved
                selectedCategories: state.selectedCategories
            }),
        }
    )
);
