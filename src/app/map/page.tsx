'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Bookstore } from '@/types';
import { getBookstores } from '@/utils/api';
import MainLayout from '@/components/layout/MainLayout';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map/Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-lg"></div>
    ),
});

export default function MapPage() {
    const [bookstores, setBookstores] = useState<Bookstore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadBookstores() {
            try {
                const response = await getBookstores();
                if (response.error) {
                    throw new Error(response.error);
                }
                setBookstores(response.data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load bookstores');
            } finally {
                setLoading(false);
            }
        }

        loadBookstores();
    }, []);

    return (
        <MainLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Bookstore Map</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <div className="h-[600px] rounded-lg overflow-hidden shadow-lg">
                    <Map bookstores={bookstores} />
                </div>
            </div>
        </MainLayout>
    );
} 