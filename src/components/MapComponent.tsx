import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useAppStore';

// Fix for default marker icon in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

function MapController() {
    const map = useMap();
    const { selectedRestaurant, isZoomed, center } = useAppStore();

    useEffect(() => {
        if (isZoomed && selectedRestaurant) {
            map.flyTo([selectedRestaurant.lat, selectedRestaurant.lng], 18, {
                duration: 2,
                easeLinearity: 0.25
            });
        } else {
            map.flyTo([center.lat, center.lng], 15, {
                duration: 1.5
            });
        }
    }, [isZoomed, selectedRestaurant, center, map]);

    return null;
}

export default function MapComponent() {
    const { selectedRestaurant, maxWalkingTime, center } = useAppStore();

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={15}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    className="map-tiles filter saturate-[0.8] contrast-[1.05]"
                />

                {/* Walking distance circle */}
                <Circle
                    center={[center.lat, center.lng]}
                    radius={maxWalkingTime * 80} // 80m/min
                    pathOptions={{
                        color: maxWalkingTime === 5 ? 'green' : maxWalkingTime === 10 ? 'yellow' : 'red',
                        fillColor: maxWalkingTime === 5 ? 'green' : maxWalkingTime === 10 ? 'yellow' : 'red',
                        fillOpacity: 0.1
                    }}
                />

                <Marker position={[center.lat, center.lng]}>
                    <Popup>
                        Start Location: <br /> {center.address}
                    </Popup>
                </Marker>

                {selectedRestaurant && (
                    <Marker
                        key={selectedRestaurant.id}
                        position={[selectedRestaurant.lat, selectedRestaurant.lng]}
                    >
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">{selectedRestaurant.name}</h3>
                                <div className="flex items-center justify-center gap-1 my-1">
                                    <span className="text-amber-500">⭐</span>
                                    <span className="font-black text-amber-700">{selectedRestaurant.rating}</span>
                                </div>
                                <p className="text-slate-500 text-sm">{selectedRestaurant.category}</p>
                                <p className="text-slate-500 text-sm">{selectedRestaurant.time} min walk</p>
                            </div>
                        </Popup>
                    </Marker>
                )}

                <MapController />
            </MapContainer>
        </div>
    );
}
