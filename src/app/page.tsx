'use client';

import { useState, useEffect } from 'react';
import { Bookstore, BookstoreFilters } from '@/types';
import { getBookstores } from '@/utils/api';
import { getFavorites } from '@/utils/favorites';
import BookstoreCard from '@/components/bookstores/BookstoreCard';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  const [bookstores, setBookstores] = useState<Bookstore[]>([]);
  const [filters, setFilters] = useState<BookstoreFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookstores();
  }, [filters.category]);

  async function loadBookstores() {
    setLoading(true);
    setError(null);

    try {
      const response = await getBookstores(filters.category);
      if (response.error) {
        throw new Error(response.error);
      }

      let filteredBookstores = response.data || [];

      if (filters.favorites) {
        const favorites = getFavorites();
        filteredBookstores = filteredBookstores.filter((store: Bookstore) =>
          favorites.includes(store.id)
        );
      }

      setBookstores(filteredBookstores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookstores');
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorites = () => {
    setFilters((prev: BookstoreFilters) => ({
      ...prev,
      favorites: !prev.favorites
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Bookstores</h1>
          <button
            onClick={toggleFavorites}
            className={`px-4 py-2 rounded-md ${filters.favorites
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700'
              }`}
          >
            Favorites
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookstores.map((bookstore) => (
            <BookstoreCard key={bookstore.id} bookstore={bookstore} />
          ))}
        </div>

        {!loading && !error && bookstores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No bookstores found.
          </div>
        )}
      </div>
    </MainLayout>
  );
}
