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

    useEffect(() => {
        if (!dateRange.start || !dateRange.end) {
            setFilteredBookshops(bookshops);
            setDateError(null);
            return;
        }

        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        if (endDate < startDate) {
            setDateError('End date cannot be before start date');
            setFilteredBookshops([]);
            return;
        }

        setDateError(null);


    }, [dateRange, bookshops]);

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
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="w-full sm:flex-1">
                            <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="start-date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="w-full sm:flex-1">
                            <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="end-date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    {dateError && (
                        <div className="text-red-400 text-center py-2 mb-4">
                            {dateError}
                        </div>
                    )}
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