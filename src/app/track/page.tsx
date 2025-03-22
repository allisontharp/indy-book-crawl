'use client';

import { useState, useEffect } from 'react';
import { BookSearch } from '@/components/BookSearch';
import { BookList } from '@/components/BookList';
import { Book } from '@/types/book';
import Header from '@/components/Header';

export default function TrackPage() {
    const [trackedBooks, setTrackedBooks] = useState<Book[]>([]);

    useEffect(() => {
        // Load tracked books from localStorage on component mount
        const savedBooks = localStorage.getItem('trackedBooks');
        if (savedBooks) {
            setTrackedBooks(JSON.parse(savedBooks));
        }
    }, []);

    const handleAddBook = (book: Book) => {
        const newBooks = [...trackedBooks, book];
        setTrackedBooks(newBooks);
        localStorage.setItem('trackedBooks', JSON.stringify(newBooks));
    };

    const handleToggleFound = (bookId: string) => {
        const newBooks = trackedBooks.map(book =>
            book.id === bookId ? { ...book, found: !book.found } : book
        );
        setTrackedBooks(newBooks);
        localStorage.setItem('trackedBooks', JSON.stringify(newBooks));
    };

    const handleRemoveBook = (bookId: string) => {
        const newBooks = trackedBooks.filter(book => book.id !== bookId);
        setTrackedBooks(newBooks);
        localStorage.setItem('trackedBooks', JSON.stringify(newBooks));
    };

    return (
        <main>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-white">Track Your Books</h1>
                <div className="grid gap-8 md:grid-cols-2">
                    <div>
                        <section>
                            <p>
                                Build your literary wishlist. Track the books you're searching for and check them off as they join your collection.                            </p>
                        </section>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-white">Search Books</h2>
                        <BookSearch onAddBook={handleAddBook} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-white">Your Tracked Books</h2>
                        <BookList
                            books={trackedBooks}
                            onToggleFound={handleToggleFound}
                            onRemoveBook={handleRemoveBook}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
} 