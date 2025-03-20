import { NextResponse } from 'next/server';
import type { Bookstore } from '@/types';

// Sample data - replace with your actual data source
const bookstores: Bookstore[] = [
    {
        id: '1',
        name: 'Indy Reads',
        address: {
            street: '1066 Virginia Ave',
            city: 'Indianapolis',
            state: 'IN',
            zip: '46203',
            coordinates: {
                lat: 39.7557,
                lng: -86.1408
            }
        },
        categories: ['Used Books', 'Independent'],
        website: 'https://www.indyreads.org',
        socials: {
            instagram: '@indyreads',
            facebook: 'IndyReads'
        }
    },
    {
        id: '2',
        name: 'Books & Brews',
        address: {
            street: '9402 Uptown Dr Suite 1400',
            city: 'Indianapolis',
            state: 'IN',
            zip: '46256',
            coordinates: {
                lat: 39.9308,
                lng: -86.0467
            }
        },
        categories: ['New Books', 'Independent', 'Cafe'],
        website: 'https://www.booksnbrews.com',
        socials: {
            instagram: '@booksnbrews',
            facebook: 'BooksNBrews'
        }
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let filteredBookstores = bookstores;

    if (category) {
        filteredBookstores = bookstores.filter(store =>
            store.categories.some(cat =>
                cat.toLowerCase() === category.toLowerCase()
            )
        );
    }

    return NextResponse.json(filteredBookstores);
} 