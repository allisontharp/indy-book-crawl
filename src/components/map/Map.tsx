import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bookstore } from '@/types';

interface MapProps {
    bookstores: Bookstore[];
}

export default function Map({ bookstores }: MapProps) {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        // Initialize map
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([39.7684, -86.1581], 12); // Indianapolis coordinates

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);
        }

        // Add markers for bookstores
        const markers = bookstores.map(bookstore => {
            const { lat, lng } = bookstore.address.coordinates;

            return L.marker([lat, lng])
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

        // Fit bounds to show all markers
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