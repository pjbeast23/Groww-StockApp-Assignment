import AsyncStorage from '@react-native-async-storage/async-storage';
import { Watchlist } from '../types';

const WATCHLIST_KEY = '@stock_app_watchlists';

/**
 * Get all watchlists
 */
export async function getWatchlists(): Promise<Watchlist[]> {
    try {
        const data = await AsyncStorage.getItem(WATCHLIST_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting watchlists:', error);
        return [];
    }
}

/**
 * Create a new watchlist
 */
export async function createWatchlist(name: string): Promise<Watchlist> {
    try {
        const watchlists = await getWatchlists();

        const newWatchlist: Watchlist = {
            id: Date.now().toString(),
            name,
            stocks: [],
            createdAt: Date.now(),
        };

        watchlists.push(newWatchlist);
        await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlists));

        return newWatchlist;
    } catch (error) {
        console.error('Error creating watchlist:', error);
        throw error;
    }
}

/**
 * Add stock to watchlist
 */
export async function addStockToWatchlist(
    watchlistId: string,
    ticker: string,
): Promise<void> {
    try {
        const watchlists = await getWatchlists();
        const watchlist = watchlists.find(w => w.id === watchlistId);

        if (!watchlist) {
            throw new Error('Watchlist not found');
        }

        // Check if stock already exists
        if (!watchlist.stocks.includes(ticker)) {
            watchlist.stocks.push(ticker);
            await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlists));
        }
    } catch (error) {
        console.error('Error adding stock to watchlist:', error);
        throw error;
    }
}

/**
 * Remove stock from watchlist
 */
export async function removeStockFromWatchlist(
    watchlistId: string,
    ticker: string,
): Promise<void> {
    try {
        const watchlists = await getWatchlists();
        const watchlist = watchlists.find(w => w.id === watchlistId);

        if (!watchlist) {
            throw new Error('Watchlist not found');
        }

        watchlist.stocks = watchlist.stocks.filter(s => s !== ticker);
        await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlists));
    } catch (error) {
        console.error('Error removing stock from watchlist:', error);
        throw error;
    }
}

/**
 * Delete watchlist
 */
export async function deleteWatchlist(watchlistId: string): Promise<void> {
    try {
        const watchlists = await getWatchlists();
        const filtered = watchlists.filter(w => w.id !== watchlistId);
        await AsyncStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting watchlist:', error);
        throw error;
    }
}

/**
 * Check if stock is in any watchlist
 */
export async function isStockInWatchlist(ticker: string): Promise<boolean> {
    try {
        const watchlists = await getWatchlists();
        return watchlists.some(w => w.stocks.includes(ticker));
    } catch (error) {
        console.error('Error checking stock in watchlist:', error);
        return false;
    }
}

/**
 * Get watchlists containing a specific stock
 */
export async function getWatchlistsForStock(ticker: string): Promise<Watchlist[]> {
    try {
        const watchlists = await getWatchlists();
        return watchlists.filter(w => w.stocks.includes(ticker));
    } catch (error) {
        console.error('Error getting watchlists for stock:', error);
        return [];
    }
}
