'use client';

import { useState } from 'react';
import { Book } from '@/types/book';

interface BookSearchProps {
    onAddBook: (book: Book) => void;
}

export function BookSearch({ onAddBook }: BookSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchBooks = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
            );
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to fetch books');
            }

            setResults(data.items || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBook = (bookData: any) => {
        const book: Book = {
            id: bookData.id,
            title: bookData.volumeInfo.title,
            authors: bookData.volumeInfo.authors || ['Unknown Author'],
            description: bookData.volumeInfo.description,
            genres: bookData.volumeInfo.categories,
            imageUrl: bookData.volumeInfo.imageLinks?.thumbnail,
            found: false,
            dateAdded: new Date().toISOString(),
        };

        onAddBook(book);
        setQuery('');
        setResults([]);
    };

    return (
        <div>
            <form onSubmit={searchBooks} className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, author, or genre..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white border-gray-700 placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="text-red-400 mb-4">{error}</div>
            )}

            <div className="space-y-4">
                {results.map((book) => (
                    <div
                        key={book.id}
                        className="p-4 border border-gray-700 rounded-lg hover:bg-gray-800"
                    >
                        <div className="flex gap-4">
                            {book.volumeInfo.imageLinks?.thumbnail && (
                                <img
                                    src={book.volumeInfo.imageLinks.thumbnail}
                                    alt={book.volumeInfo.title}
                                    className="w-20 h-28 object-cover rounded"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-white">{book.volumeInfo.title}</h3>
                                <div className="mt-1">
                                    <span className="text-blue-400 text-sm font-medium">Authors: </span>
                                    <span className="text-gray-300">
                                        {book.volumeInfo.authors?.join(', ') || 'Unknown Author'}
                                    </span>
                                </div>
                                {book.volumeInfo.categories && (
                                    <div className="mt-1">
                                        <span className="text-blue-400 text-sm font-medium">Genres: </span>
                                        <span className="text-gray-300">
                                            {book.volumeInfo.categories.join(', ')}
                                        </span>
                                    </div>
                                )}
                                {book.volumeInfo.description && (
                                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                                        {book.volumeInfo.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => handleAddBook(book)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 h-fit"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 