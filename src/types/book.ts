export interface Book {
    id: string;
    title: string;
    authors: string[];
    description?: string;
    genres?: string[];
    imageUrl?: string;
    found: boolean;
    dateAdded: string;
} 