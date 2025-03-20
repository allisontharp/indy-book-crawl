import { Bookstore } from '@/types';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export async function getBookstores(category?: string): Promise<ApiResponse<Bookstore[]>> {
    try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/bookstores${category ? `?category=${category}` : ''}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Bookstore[] = await response.json();
        return { data };
    } catch (error) {
        console.error('Error fetching bookstores:', error);
        return { error: error instanceof Error ? error.message : 'Failed to fetch bookstores' };
    }
} 