'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import BookshopCard from './BookshopCard';
import { Bookshop } from '@/types';

async function fetchBookshops() {
  return api.get('/bookshops');
  // return api.get('/bookshops?approved=true');
}

export default function BookshopsList() {
  const { data: bookshops, isLoading, error } = useQuery<Bookshop[]>({
    queryKey: ['bookshops'],
    queryFn: fetchBookshops,
  });

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
        <p>No bookshops. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookshops.map((bookshop) => (
        <BookshopCard key={bookshop.id} bookshop={bookshop} />
      ))}
    </div>
  );
}