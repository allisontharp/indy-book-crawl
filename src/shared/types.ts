export interface Bookstore {
    id: string;
    name: string;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        latitude?: number;
        longitude?: number;
    };
    categories: string[];
    website?: string;
    socials?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
    };
}

export interface BookstoreFilters {
    category?: string;
    favorites?: boolean;
} 