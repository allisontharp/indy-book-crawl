'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { api } from '@/utils/api';
import { getFavorites } from '@/utils/favorites';
import { Bookshop } from '@/types';
import BookshopCard from '@/components/BookshopCard';

export default function FavoritesPage() {
    const router = useRouter();
    const [favoriteBookshops, setFavoriteBookshops] = useState<Bookshop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFavoriteShows() {
            try {
                const favorites = getFavorites();
                if (favorites.length === 0) {
                    setFavoriteBookshops([]);
                    setIsLoading(false);
                    return;
                }

                const bookshops = await Promise.all(
                    favorites.map(async (fav) => {
                        try {
                            return await api.get(`/bookshops/${fav.id}`);
                        } catch (e) {
                            console.error(`Error fetching bookshop ${fav.id}:`, e);
                            return null;
                        }
                    })
                );

                // Filter out any null values from failed fetches
                const validBookshops = bookshops.filter((shop): shop is Bookshop => shop !== null);
                setFavoriteBookshops(validBookshops);
            } catch (e) {
                console.error('Error fetching favorite bookshops:', e);
                setError('Failed to load favorite car bookshops');
            } finally {
                setIsLoading(false);
            }
        }

        fetchFavoriteShows();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-800 rounded-lg p-6 shadow-lg animate-pulse">
                                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-gray-100">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
                        {error}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Favorite Bookshops</h1>
                    <button
                        onClick={() => router.push('/')}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        View All Bookshops →
                    </button>
                </div>

                {favoriteBookshops.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                        <p className="text-gray-400 mb-4">You haven't favorited any bookshops yet.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Browse Bookshops →
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteBookshops.map((shop) => (
                            <BookshopCard key={shop.id} bookshop={shop} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
} 