'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { Bookshop } from '@/types';
import BookshopForm from '@/components/BookshopForm';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

async function fetchBookshop(id: string) {
    return api.get(`/bookshops/${id}`);
}

export default function EditBookshopPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: bookshop, isLoading, error } = useQuery<Bookshop>({
        queryKey: ['bookshop', params.id],
        queryFn: () => fetchBookshop(params.id),
    });

    useEffect(() => {
        if (session?.user?.role !== 'ADMIN') {
            router.push('/');
        }
    }, [session, router]);

    const handleSubmit = async (data: Partial<Bookshop>) => {
        try {
            await api.patch(`/bookshops/${params.id}`, data);
            router.push(`/bookshops/${params.id}`);
        } catch (error) {
            console.error('Error updating bookshop:', error);
            throw error;
        }
    };

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
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-100">Edit Bookshop</h1>
                            <p className="mt-2 text-gray-400">Update the details for {bookshop.name}</p>
                        </div>
                        <BookshopForm
                            initialData={bookshop}
                            onSubmit={handleSubmit}
                            submitText="Update Bookshop"
                            showCancelButton={true}
                            onCancel={() => router.push(`/bookshops/${params.id}`)}
                            isAdmin={true}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
} 