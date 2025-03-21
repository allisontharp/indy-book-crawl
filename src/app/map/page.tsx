'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/utils/api';
import Header from '@/components/Header';
import Link from 'next/link';
import { Bookshop } from '@/types';
import { getFavorites } from '@/utils/favorites';

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
    const [showFavorites, setShowFavorites] = useState(false);

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

    useEffect(() => {
        if (showFavorites) {
            const favorites = getFavorites();
            const favoriteBookshops = bookshops.filter(shop =>
                favorites.some(fav => fav.id === shop.id)
            );
            setFilteredBookshops(favoriteBookshops);
        } else {
            setFilteredBookshops(bookshops);
        }
    }, [showFavorites, bookshops]);

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
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">Map</h1>
                        <button
                            onClick={() => setShowFavorites(!showFavorites)}
                            className={`px-4 py-2 rounded-md flex items-center space-x-2 ${showFavorites
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill={showFavorites ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span>Show Favorites</span>
                        </button>
                    </div>

                    {error ? (
                        <div className="text-red-400 text-center py-4">
                            {error}
                        </div>
                    ) : filteredBookshops.length === 0 ? (
                        <div className="text-gray-400 text-center py-4">
                            {showFavorites
                                ? 'No favorite bookshops yet'
                                : dateError
                                    ? 'Please select a valid date range'
                                    : 'No bookshops found for the selected date range'
                            }
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