import { NextResponse } from 'next/server';
import type { Bookstore } from '@/types';

// CORS headers configuration
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // In production, replace with your specific domain
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

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

    try {
        let filteredBookstores = [...bookstores];

        if (category) {
            filteredBookstores = filteredBookstores.filter(store =>
                store.categories.includes(category)
            );
        }

        return NextResponse.json(filteredBookstores, { headers: corsHeaders });
    } catch (error) {
        console.error('Error processing bookstores:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookstores' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name || !body.address) {
            return NextResponse.json(
                { error: 'Name and address are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate address fields
        if (!body.address.street || !body.address.city || !body.address.state || !body.address.zip) {
            return NextResponse.json(
                { error: 'Complete address is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error('API URL not configured');
        }

        // Forward the request to the API Gateway
        const response = await fetch(`${apiUrl}bookstores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // TODO: Add authorization header once Cognito is set up
                // 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create bookstore');
        }

        const data = await response.json();
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.error('Error creating bookstore:', error);
        return NextResponse.json(
            { error: 'Failed to create bookstore' },
            { status: 500, headers: corsHeaders }
        );
    }
} 