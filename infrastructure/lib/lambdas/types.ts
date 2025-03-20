import { Bookstore } from '../../../src/shared/types';

export interface Event {
    id: string;
    bookstoreId: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    eventHours: {
        date: string;
        hours: string;
    }[];
}

// DynamoDB item types
export interface BookstoreItem {
    PK: string;  // BOOKSTORE#<id>
    SK: string;  // METADATA#<id>
    GSI1PK: string; // CATEGORY#<category>
    GSI1SK: string; // BOOKSTORE#<n>
    type: 'bookstore';
    data: Bookstore;
}

export interface EventItem {
    PK: string;  // EVENT#<id>
    SK: string;  // BOOKSTORE#<bookstoreId>
    GSI1PK: string; // DATE#<date>
    GSI1SK: string; // EVENT#<n>
    type: 'event';
    data: Event;
}

export interface CategoryItem {
    PK: string;  // CATEGORY#<name>
    SK: string;  // METADATA
    type: 'category';
    name: string;
    description?: string;
} 