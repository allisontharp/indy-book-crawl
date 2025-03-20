const FAVORITES_KEY = 'bookstore-favorites';

export function getFavorites(): string[] {
    if (typeof window === 'undefined') return [];
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

export function addFavorite(bookstoreId: string): void {
    if (typeof window === 'undefined') return;
    const favorites = getFavorites();
    if (!favorites.includes(bookstoreId)) {
        favorites.push(bookstoreId);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
}

export function removeFavorite(bookstoreId: string): void {
    if (typeof window === 'undefined') return;
    const favorites = getFavorites();
    const index = favorites.indexOf(bookstoreId);
    if (index > -1) {
        favorites.splice(index, 1);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
}

export function isFavorite(bookstoreId: string): boolean {
    if (typeof window === 'undefined') return false;
    return getFavorites().includes(bookstoreId);
} 