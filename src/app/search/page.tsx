'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { api } from '@/utils/api';
import { Bookshop } from '@/types';
import BookshopCard from '@/components/BookshopCard';

async function searchBookshops(query: string) {
  return await api.get(`/bookshops?q=${encodeURIComponent(query)}`);
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  const { data: bookshops, isLoading, error } = useQuery<Bookshop[]>({
    queryKey: ['bookshops', 'search', query],
    queryFn: () => searchBookshops(query),
    enabled: !!query,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">
          Search Results: {query}
        </h1>
        <p className="mt-2 text-gray-400">
          {bookshops?.length || 0} bookshops found
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded">
          Failed to load search results. Please try again.
        </div>
      )}

      {!isLoading && !error && bookshops?.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-300">No bookshops found matching your search.</p>
          <p className="text-gray-400 mt-2">Try adjusting your search terms or browse all bookshops.</p>
        </div>
      )}

      {bookshops && bookshops.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookshops.map((bookshop) => (
            <BookshopCard key={bookshop.id} bookshop={bookshop} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main>
      <Header />
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}