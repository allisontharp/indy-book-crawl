'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Bookshop } from '@/types';

// Component to handle map updates and throttling
function MapController() {
    const map = useMap();

    useEffect(() => {
        // Set a minimum zoom level to prevent excessive tile loading
        map.setMinZoom(7);

        // Add throttling to tile loading
        map.on('loading', () => {
            // Add a small delay to prevent rapid tile requests
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        });
    }, [map]);

    return null;
}

interface MapComponentProps {
    bookshops: Bookshop[];
    icon: any; // Using any for now since we're dynamically importing Leaflet
}

export default function MapComponent({ bookshops, icon }: MapComponentProps) {
    const [isMapLoading, setIsMapLoading] = useState(true);

    // Center on Indianapolis
    const indianapolisCenter = {
        lat: 39.7684,
        lng: -86.1581
    };

    return (
        <>
            {isMapLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            <MapContainer
                center={[indianapolisCenter.lat, indianapolisCenter.lng]}
                zoom={9}
                style={{ height: '100%', width: '100%' }}
                maxZoom={18}
                minZoom={7}
            >
                <MapController />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    maxNativeZoom={19}
                    updateWhenIdle={true}
                    updateWhenZooming={false}
                    eventHandlers={{
                        loading: () => setIsMapLoading(true),
                        load: () => setIsMapLoading(false)
                    }}
                />
                {bookshops.map((shop) => (
                    <Marker
                        key={shop.id}
                        position={[shop.latitude, shop.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-lg mb-2">{shop.name}</h3>
                                <p className="text-sm mb-2">{shop.city}, {shop.state}</p>
                                <Link
                                    href={`/bookshops/${shop.id}`}
                                    className="text-blue-500 hover:text-blue-400 text-sm"
                                >
                                    View Details →
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </>
    );
} 