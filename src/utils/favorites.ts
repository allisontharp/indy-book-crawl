import { CarShow } from '@/types';

interface FavoriteData {
    id: string;
    timestamp: number;
    // We can extend this interface later to add more metadata
}

const FAVORITES_STORAGE_KEY = 'car_show_favorites';

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

export function isFavorite(carShowId: string): boolean {
    return getFavorites().some(fav => fav.id === carShowId);
}

export function addFavorite(carShowId: string): void {
    if (typeof window === 'undefined') return;

    const favorites = getFavorites();
    if (!favorites.some(fav => fav.id === carShowId)) {
        favorites.push({
            id: carShowId,
            timestamp: Date.now()
        });
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
}

export function removeFavorite(carShowId: string): void {
    if (typeof window === 'undefined') return;

    const favorites = getFavorites().filter(fav => fav.id !== carShowId);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
}

export function toggleFavorite(carShowId: string): boolean {
    if (isFavorite(carShowId)) {
        removeFavorite(carShowId);
        return false;
    } else {
        addFavorite(carShowId);
        return true;
    }
} 