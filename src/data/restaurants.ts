export interface Restaurant {
    id: string;
    name: string;
    category: string;
    lat: number;
    lng: number;
    distance: number; // in meters
    time: number; // walking time in minutes
    rating: number; // 1.0 - 5.0
}

// Center: Seoul Seocho-gu Hyoryeong-ro 256 (Approx 37.4841, 127.0162)
export const CENTER = {
    lat: 37.4841,
    lng: 127.0162,
    address: "서울 서초구 효령로 256 세원빌딩"
};

export const MOCK_RESTAURANTS: Restaurant[] = [
];
