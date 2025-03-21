import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bookstore } from '@/types';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    bookstores: Bookstore[];
}

// Default coordinates for Indianapolis
const INDY_COORDINATES = {
    lat: 39.7684,
    lng: -86.1581
};

export default function Map({ bookstores }: MapProps) {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // Initialize map
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([INDY_COORDINATES.lat, INDY_COORDINATES.lng], 12);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }

        // Add markers for bookstores that have coordinates
        const markers = bookstores
            .filter((bookstore): bookstore is Bookstore & { address: { latitude: number; longitude: number } } =>
                typeof bookstore.address?.latitude === 'number' &&
                typeof bookstore.address?.longitude === 'number'
            )
            .map(bookstore => {
                const coordinates = {
                    lat: bookstore.address.latitude,
                    lng: bookstore.address.longitude
                };

                return L.marker([coordinates.lat, coordinates.lng])
                    .bindPopup(`
                        <div class="p-2">
                            <h3 class="font-bold">${bookstore.name}</h3>
                            <p class="text-sm">${bookstore.address.street}<br/>
                            ${bookstore.address.city}, ${bookstore.address.state} ${bookstore.address.zip}</p>
                            ${bookstore.website ? `<a href="${bookstore.website}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 text-sm">Visit Website</a>` : ''}
                        </div>
                    `)
                    .addTo(mapRef.current!);
            });

        // If no bookstores have coordinates, just show the default Indianapolis view
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
        }

        // Cleanup
        return () => {
            markers.forEach(marker => marker.remove());
        };
    }, [bookstores]);

    return <div id="map" className="w-full h-full" />;
} 