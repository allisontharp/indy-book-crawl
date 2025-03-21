'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/utils/api';
import Header from '@/components/Header';
import Link from 'next/link';
import { Bookshop } from '@/types';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

// Dynamically import Leaflet CSS
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="animate-pulse">
            <div className="h-[600px] bg-gray-800 rounded-lg"></div>
        </div>
    ),
});

// Fix for default marker icons in Next.js
const icon = typeof window !== 'undefined' ? require('leaflet').icon({
    iconUrl: '/marker-icon.svg',
    shadowUrl: '/marker-shadow.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
}) : null;

export default function MapPage() {
    const [bookshops, setBookshops] = useState<Bookshop[]>([]);
    const [filteredBookshops, setFilteredBookshops] = useState<Bookshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [dateError, setDateError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBookshops = async () => {
            try {
                const response = await api.get('/bookshops');
                setBookshops(response || []);
                setFilteredBookshops(response || []);
            } catch (error) {
                console.error('Error fetching bookshops:', error);
                setError('Failed to load bookshops. Please try again later.');
                setBookshops([]);
                setFilteredBookshops([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookshops();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-96 bg-gray-800 rounded-lg"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h1 className="text-3xl font-bold mb-6">Map</h1>

                    {error ? (
                        <div className="text-red-400 text-center py-4">
                            {error}
                        </div>
                    ) : filteredBookshops.length === 0 ? (
                        <div className="text-gray-400 text-center py-4">
                            {dateError ? 'Please select a valid date range' : 'No car shows found for the selected date range'}
                        </div>
                    ) : (
                        <div className="relative h-[600px] w-full rounded-lg overflow-hidden">
                            <MapComponent bookshops={filteredBookshops} icon={icon} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 