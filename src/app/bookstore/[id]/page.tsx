'use client';

import { useEffect, useState } from 'react';
import { Bookstore } from '@/types';
import MainLayout from '@/components/layout/MainLayout';
import { FaGlobe, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';

export default function BookstorePage({ params }: { params: { id: string } }) {
    const [bookstore, setBookstore] = useState<Bookstore | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadBookstore() {
            try {
                const response = await fetch(`/api/bookstores/${params.id}`);
                if (!response.ok) {
                    throw new Error('Failed to load bookstore');
                }
                const data = await response.json();
                setBookstore(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        loadBookstore();
    }, [params.id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            </MainLayout>
        );
    }

    if (error || !bookstore) {
        return (
            <MainLayout>
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
                    {error || 'Bookstore not found'}
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {bookstore.name}
                    </h1>

                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            {bookstore.address.street}<br />
                            {bookstore.address.city}, {bookstore.address.state} {bookstore.address.zip}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            {bookstore.categories.map((category) => (
                                <span
                                    key={category}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>

                        <div className="flex space-x-4">
                            {bookstore.website && (
                                <a
                                    href={bookstore.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    <FaGlobe size={24} />
                                </a>
                            )}
                            {bookstore.socials?.instagram && (
                                <a
                                    href={bookstore.socials.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
                                >
                                    <FaInstagram size={24} />
                                </a>
                            )}
                            {bookstore.socials?.facebook && (
                                <a
                                    href={bookstore.socials.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                >
                                    <FaFacebook size={24} />
                                </a>
                            )}
                            {bookstore.socials?.twitter && (
                                <a
                                    href={bookstore.socials.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300"
                                >
                                    <FaTwitter size={24} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 