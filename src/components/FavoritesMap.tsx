'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Bookshop } from '@/types';

// Dynamically import MapComponent with no SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false
});

interface FavoritesMapProps {
    bookshops: Bookshop[];
}

export default function FavoritesMap({ bookshops }: FavoritesMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [icon, setIcon] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
        // Dynamically import Leaflet only on client side
        import('leaflet').then((L) => {
            setIcon(L.icon({
                iconUrl: '/marker-icon.svg',
                shadowUrl: '/marker-shadow.svg',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            }));
        });
    }, []);

    if (!isMounted || !icon) {
        return null;
    }

    return (
        <div className="h-[400px] mb-8 rounded-lg overflow-hidden">
            <MapComponent bookshops={bookshops} icon={icon} />
        </div>
    );
} 