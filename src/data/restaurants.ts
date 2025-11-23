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
    {
        id: '1',
        name: '맛있는 김치찌개',
        category: 'Korean',
        lat: 37.4845,
        lng: 127.0165,
        distance: 100,
        time: 2
    },
    {
        id: '2',
        name: '서초 돈까스',
        category: 'Japanese',
        lat: 37.4838,
        lng: 127.0158,
        distance: 150,
        time: 3
    },
    {
        id: '3',
        name: '효령 파스타',
        category: 'Italian',
        lat: 37.4850,
        lng: 127.0170,
        distance: 300,
        time: 5
    },
    {
        id: '4',
        name: '남부터미널 국밥',
        category: 'Korean',
        lat: 37.4830,
        lng: 127.0150,
        distance: 400,
        time: 7
    },
    {
        id: '5',
        name: '스시 마이',
        category: 'Japanese',
        lat: 37.4855,
        lng: 127.0180,
        distance: 500,
        time: 8
    },
    {
        id: '6',
        name: '버거 킹덤',
        category: 'Western',
        lat: 37.4825,
        lng: 127.0145,
        distance: 600,
        time: 10
    },
    {
        id: '7',
        name: '매운 떡볶이',
        category: 'Snack',
        lat: 37.4860,
        lng: 127.0190,
        distance: 700,
        time: 12
    },
    {
        id: '8',
        name: '건강 샐러드',
        category: 'Western',
        lat: 37.4820,
        lng: 127.0140,
        distance: 800,
        time: 14
    }
];
