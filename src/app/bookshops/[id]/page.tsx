'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Bookshop, DayOfWeek } from '@/types';
import FavoriteButton from '@/components/FavoriteButton';
import Header from '@/components/Header';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

async function fetchBookshop(id: string) {
    return api.get(`/bookshops/${id}`);
}

export default function BookshopPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const { data: bookshop, isLoading, error } = useQuery<Bookshop>({
        queryKey: ['bookshop', params.id],
        queryFn: () => fetchBookshop(params.id),
    });

    if (isLoading) {
        return (
            <main>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="w-full flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !bookshop) {
        return (
            <main>
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <p>Unable to load bookshop details. Please try again later.</p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-100 mb-2">{bookshop.name}</h1>
                                <div className="flex items-center text-gray-300">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>{bookshop.city}, {bookshop.state} {bookshop.zipCode}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {session?.user?.role === 'ADMIN' && (
                                    <Link
                                        href={`/admin/bookshops/${bookshop.id}/edit`}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                    </Link>
                                )}
                                <FavoriteButton id={bookshop.id} />
                            </div>
                        </div>

                        <div className="prose prose-invert max-w-none mb-8">
                            <p className="text-gray-300">{bookshop.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-100 mb-4">Hours</h2>
                                <div className="space-y-2">
                                    {bookshop.hours && bookshop.hours.length > 0 ? (
                                        bookshop.hours
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
                                            ))
                                    ) : (
                                        <div className="text-gray-400 italic">
                                            Operating hours not available. Please check the website or contact the bookshop directly.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-100 mb-4">Contact & Social</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"></path>
                                        </svg>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${bookshop.address}, ${bookshop.city}, ${bookshop.state} ${bookshop.zipCode}`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-blue-400 transition-colors"
                                        >
                                            {bookshop.address}
                                        </a>
                                    </div>

                                    {bookshop.website && (
                                        <a
                                            href={bookshop.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-blue-400 hover:text-blue-300"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
                                            </svg>
                                            Visit Website
                                        </a>
                                    )}

                                    <div className="flex space-x-4">
                                        {bookshop.instagram && (
                                            <a
                                                href={bookshop.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-gray-300"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                </svg>
                                            </a>
                                        )}
                                        {bookshop.facebook && (
                                            <a
                                                href={bookshop.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-gray-300"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                                </svg>
                                            </a>
                                        )}
                                        {bookshop.twitter && (
                                            <a
                                                href={bookshop.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-gray-300"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {bookshop.categories && bookshop.categories.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-100 mb-4">Categories</h2>
                                <div className="flex flex-wrap gap-2">
                                    {bookshop.categories.map((category) => (
                                        <span
                                            key={category}
                                            className="bg-gray-700 text-gray-300 text-sm font-semibold px-3 py-1 rounded-full"
                                        >
                                            {category}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {bookshop.events && bookshop.events.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-100 mb-4">Upcoming Events</h2>
                                <div className="space-y-4">
                                    {bookshop.events.map((event) => {
                                        // Get the day of week for the event date
                                        const eventDay = new Date(event.date).getDay();
                                        const dayOfWeek = Object.values(DayOfWeek)[eventDay];

                                        // Find the shop hours for the event's day
                                        const shopHours = bookshop.hours.find(h => h.dayOfWeek === dayOfWeek);

                                        // Use event time or shop open time
                                        const startTime = event.time || shopHours?.openTime;
                                        const endTime = event.endTime || shopHours?.closeTime;

                                        return (
                                            <div key={event.id} className="bg-gray-700 rounded-lg p-4">
                                                <h3 className="text-lg font-semibold text-gray-100 mb-2">{event.title}</h3>
                                                <p className="text-gray-300 mb-2">{event.description}</p>
                                                <div className="flex items-center text-sm text-gray-400">
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                                                    </svg>
                                                    <span>
                                                        {new Date(event.date).toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="mx-2">•</span>
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                                    </svg>
                                                    <span>
                                                        {startTime && new Date(`1970-01-01T${startTime}`).toLocaleTimeString('en-US', {
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}
                                                        {endTime && (
                                                            <>
                                                                {' - '}
                                                                {new Date(`1970-01-01T${endTime}`).toLocaleTimeString('en-US', {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit'
                                                                })}
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
} 