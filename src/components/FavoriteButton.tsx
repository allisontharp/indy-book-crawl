'use client';

import { isFavorite, toggleFavorite } from '@/utils/favorites';
import { useState, useEffect } from 'react';

interface FavoriteButtonProps {
    id: string;
    className?: string;
}

export default function FavoriteButton({ id, className = '' }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        setIsFavorited(isFavorite(id));
    }, [id]);

    const handleClick = () => {
        const newState = toggleFavorite(id);
        setIsFavorited(newState);
    };

    return (
        <button
            onClick={handleClick}
            className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <svg
                className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400 stroke-current'}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
} 