'use client';

import { Book } from '@/types/book';

interface BookListProps {
    books: Book[];
    onToggleFound: (bookId: string) => void;
    onRemoveBook: (bookId: string) => void;
}

export function BookList({ books, onToggleFound, onRemoveBook }: BookListProps) {
    if (books.length === 0) {
        return (
            <div className="text-gray-400 text-center py-8">
                No books tracked yet. Search for books to add them to your list!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {books.map((book) => (
                <div
                    key={book.id}
                    className={`p-4 border border-gray-700 rounded-lg ${book.found ? 'bg-green-900/30' : 'bg-gray-800'
                        }`}
                >
                    <div className="flex gap-4">
                        {book.imageUrl && (
                            <img
                                src={book.imageUrl}
                                alt={book.title}
                                className="w-20 h-28 object-cover rounded"
                            />
                        )}
                        <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <h3 className="font-semibold text-white text-lg">{book.title}</h3>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1">
                                        <div>
                                            <span className="text-blue-400 text-sm font-medium">By: </span>
                                            <span className="text-gray-300">{book.authors.join(', ')}</span>
                                        </div>
                                        {book.genres && book.genres.length > 0 && (
                                            <div>
                                                <span className="text-blue-400 text-sm font-medium">Genre: </span>
                                                <span className="text-gray-300">{book.genres.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                    {book.description && (
                                        <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                                            {book.description}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => onToggleFound(book.id)}
                                        className={`px-3 py-1 rounded whitespace-nowrap ${book.found
                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                            }`}
                                    >
                                        {book.found ? 'Found!' : 'Mark Found'}
                                    </button>
                                    <button
                                        onClick={() => onRemoveBook(book.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 whitespace-nowrap"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 