import { Bookstore } from '@/types';
import { FaHeart, FaRegHeart, FaGlobe, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import { isFavorite, addFavorite, removeFavorite } from '@/utils/favorites';
import Link from 'next/link';
import { useState } from 'react';

interface BookstoreCardProps {
    bookstore: Bookstore;
}

export default function BookstoreCard({ bookstore }: BookstoreCardProps) {
    const [isFav, setIsFav] = useState(() => isFavorite(bookstore.id));

    const toggleFavorite = () => {
        if (isFav) {
            removeFavorite(bookstore.id);
        } else {
            addFavorite(bookstore.id);
        }
        setIsFav(!isFav);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <Link href={`/bookstore/${bookstore.id}` as const}>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                            {bookstore.name}
                        </h3>
                    </Link>
                    <button
                        onClick={toggleFavorite}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFav ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                    </button>
                </div>

                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {bookstore.address.street}<br />
                    {bookstore.address.city}, {bookstore.address.state} {bookstore.address.zip}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {bookstore.categories.map((category: string) => (
                        <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                        >
                            {category}
                        </span>
                    ))}
                </div>

                <div className="mt-4 flex space-x-4">
                    {bookstore.website && (
                        <a
                            href={bookstore.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                            <FaGlobe size={20} />
                        </a>
                    )}
                    {bookstore.socials?.instagram && (
                        <a
                            href={bookstore.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-pink-600 dark:text-gray-400 dark:hover:text-pink-400"
                        >
                            <FaInstagram size={20} />
                        </a>
                    )}
                    {bookstore.socials?.facebook && (
                        <a
                            href={bookstore.socials.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                            <FaFacebook size={20} />
                        </a>
                    )}
                    {bookstore.socials?.twitter && (
                        <a
                            href={bookstore.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-400 dark:text-gray-400 dark:hover:text-blue-300"
                        >
                            <FaTwitter size={20} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
} 