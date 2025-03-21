import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';

// Simple in-memory store for rate limiting
const RATE_LIMIT_DURATION = 1000; // 1 second
const requestTimestamps = new Map<string, number>();

function isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const lastRequest = requestTimestamps.get(identifier) || 0;

    if (now - lastRequest < RATE_LIMIT_DURATION) {
        return true;
    }

    requestTimestamps.set(identifier, now);
    return false;
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of requestTimestamps.entries()) {
        if (now - timestamp > RATE_LIMIT_DURATION * 2) {
            requestTimestamps.delete(key);
        }
    }
}, RATE_LIMIT_DURATION * 10);


export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const logger = new Logger({ serviceName: 'getGeocode' });

    const searchParams = new URLSearchParams(event.rawQueryString);
    const zipCode = searchParams.get('zipCode');

    if (!zipCode) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Zip code is required' })
        }
    }

    // Get IP for rate limiting
    // In production, you might want to use X-Forwarded-For or similar
    const identifier = zipCode;

    if (isRateLimited(identifier)) {
        return {
            statusCode: 429,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Too many requests, please try again later' })
        }
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${zipCode}&country=USA&format=json`
        );

        if (!response.ok) {
            console.error('Geocoding failed:', response.statusText);
            throw new Error('Failed to geocode');
        }

        const data = await response.json();

        if (data && data[0]) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                })
            }
        }

        logger.warn(`Location not found for zip code: ${zipCode}`);
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Location not found' })
        }
    } catch (error) {
        logger.error(`Error fetching geocode for zip code`);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        }
    }
}