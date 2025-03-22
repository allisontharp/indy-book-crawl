interface FavoriteData {
    id: string;
    timestamp: number;
    // We can extend this interface later to add more metadata
}

const FAVORITES_STORAGE_KEY = 'bookshop_favorites';

export function getFavorites(): FavoriteData[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error('Error parsing favorites:', e);
        return [];
    }
}

export function isFavorite(bookshopID: string): boolean {
    return getFavorites().some(fav => fav.id === bookshopID);
}

export function addFavorite(bookshopID: string): void {
    if (typeof window === 'undefined') return;

    const favorites = getFavorites();
    if (!favorites.some(fav => fav.id === bookshopID)) {
        favorites.push({
            id: bookshopID,
            timestamp: Date.now()
        });
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
}

export function removeFavorite(bookshopID: string): void {
    if (typeof window === 'undefined') return;

    const favorites = getFavorites().filter(fav => fav.id !== bookshopID);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(bookshopID: string): boolean {
    if (isFavorite(bookshopID)) {
        removeFavorite(bookshopID);
        return false;
    } else {
        addFavorite(bookshopID);
        return true;
    }
} 