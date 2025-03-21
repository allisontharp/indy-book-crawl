'use client';

import { useState, useEffect } from 'react';
import { Bookshop, BookshopFilters } from '@/types';
import BookstoreCard from '@/components/bookstores/BookstoreCard';
import MainLayout from '@/components/layout/MainLayout';
import { api } from 'utils/api';
import { useQuery } from '@tanstack/react-query';


async function fetchBookshops() {
  return api.get('/bookshops');
}

export default function Home() {
  const { data: bookshops, isLoading, error } = useQuery<Bookshop[]>({
    queryKey: ['bookshops'],
    queryFn: fetchBookshops,
  });
  const [filters, setFilters] = useState<BookshopFilters>({});

  const toggleFavorites = () => {
    setFilters((prev: BookshopFilters) => ({
      ...prev,
      favorites: !prev.favorites
    }));
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p>Unable to load bookshops. Please try again later.</p>
      </div>
    );
  }

  if (!bookshops?.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p>No bookshops found. Check back soon!</p>
      </div>
    );
  }

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

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookshops?.map((bookshop: Bookshop) => (
            <BookstoreCard key={bookshop.id} bookstore={bookshop} />
          ))}
        </div>

      </div>
    </MainLayout>
  );
}
