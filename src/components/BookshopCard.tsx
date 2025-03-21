'use client';

import { Bookshop, DayOfWeek } from '@/types';
import FavoriteButton from './FavoriteButton';

interface BookshopCardProps {
  bookshop: Bookshop;
}

export default function BookshopCard({ bookshop }: BookshopCardProps) {
  // Ensure times is always an array
  const times = bookshop.hours || [];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-100 mb-2">{bookshop.name}</h3>
          <div className="flex items-center space-x-2">
            <FavoriteButton id={bookshop.id} />
          </div>
        </div>


        <div className="flex items-center text-gray-300 mb-4">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
          <span>{bookshop.city}</span>
        </div>

        <p className="text-gray-400 line-clamp-3 mb-4">{bookshop.description}</p>

        {bookshop.hours.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Hours:</h4>
            <div className="space-y-1">
              {times
                .sort((a, b) => {
                  const days = Object.values(DayOfWeek);
                  return days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek);
                })
                .map(time => (
                  <div key={time.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 capitalize">{time.dayOfWeek}</span>
                    <span className="text-gray-300">
                      {new Date(`1970-01-01T${time.openTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                      {' - '}
                      {new Date(`1970-01-01T${time.closeTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <a
            href={`/bookshops/${bookshop.id}`}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            View Details →
          </a>

          {bookshop.categories && bookshop.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {bookshop.categories.map((category) => (
                <span
                  key={category}
                  className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}