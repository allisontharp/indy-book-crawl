'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Bookshop } from '@/types';
import { api } from '@/utils/api';
import BookshopForm from '@/components/BookshopForm';

export default function NewBookshopPage() {
    const router = useRouter();

    const handleSubmit = async (bookshopData: Partial<Bookshop>) => {
        try {
            const response = await api.post('/bookshops', bookshopData);

            console.log(`response`, response)
            router.push('/');
        } catch (error) {
            console.error(`error`, error)
            throw new Error('Failed to submit book shop');
        }
    };

    return (
        <div className="min-h-full">
            <Header />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-100 mb-6">Submit a New Bookshop</h1>
                <BookshopForm onSubmit={handleSubmit} />
            </div>
        </div>
    );
}