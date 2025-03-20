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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <Link href={`/bookstore/${bookstore.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600">
                            {bookstore.name}
                        </h3>
                    </Link>
                    <button
                        onClick={toggleFavorite}
                        className="text-red-500 hover:text-red-600"
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                        {isFav ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                    </button>
                </div>

                <p className="mt-2 text-gray-600">
                    {bookstore.address.street}<br />
                    {bookstore.address.city}, {bookstore.address.state} {bookstore.address.zip}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {bookstore.categories.map((category: string) => (
                        <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
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
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaGlobe size={20} />
                        </a>
                    )}
                    {bookstore.socials?.instagram && (
                        <a
                            href={bookstore.socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-pink-600"
                        >
                            <FaInstagram size={20} />
                        </a>
                    )}
                    {bookstore.socials?.facebook && (
                        <a
                            href={bookstore.socials.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-600"
                        >
                            <FaFacebook size={20} />
                        </a>
                    )}
                    {bookstore.socials?.twitter && (
                        <a
                            href={bookstore.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-blue-400"
                        >
                            <FaTwitter size={20} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
} 