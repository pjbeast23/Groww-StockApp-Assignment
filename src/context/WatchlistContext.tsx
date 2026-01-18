import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Watchlist } from '../types';
import * as WatchlistService from '../services/watchlist';

interface WatchlistContextType {
    watchlists: Watchlist[];
    loading: boolean;
    refreshWatchlists: () => Promise<void>;
    createWatchlist: (name: string) => Promise<Watchlist>;
    addToWatchlist: (watchlistId: string, ticker: string) => Promise<void>;
    removeFromWatchlist: (watchlistId: string, ticker: string) => Promise<void>;
    deleteWatchlist: (watchlistId: string) => Promise<void>;
    isInWatchlist: (ticker: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(
    undefined,
);

export function WatchlistProvider({ children }: { children: ReactNode }) {
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWatchlists();
    }, []);

    const loadWatchlists = async () => {
        try {
            setLoading(true);
            const data = await WatchlistService.getWatchlists();
            setWatchlists(data);
        } catch (error) {
            console.error('Error loading watchlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshWatchlists = async () => {
        await loadWatchlists();
    };

    const createWatchlist = async (name: string) => {
        const newWatchlist = await WatchlistService.createWatchlist(name);
        setWatchlists(prev => [...prev, newWatchlist]);
        return newWatchlist;
    };

    const addToWatchlist = async (watchlistId: string, ticker: string) => {
        await WatchlistService.addStockToWatchlist(watchlistId, ticker);
        await refreshWatchlists();
    };

    const removeFromWatchlist = async (watchlistId: string, ticker: string) => {
        await WatchlistService.removeStockFromWatchlist(watchlistId, ticker);
        await refreshWatchlists();
    };

    const deleteWatchlist = async (watchlistId: string) => {
        await WatchlistService.deleteWatchlist(watchlistId);
        setWatchlists(prev => prev.filter(w => w.id !== watchlistId));
    };

    const isInWatchlist = (ticker: string): boolean => {
        return watchlists.some(w => w.stocks.includes(ticker));
    };

    return (
        <WatchlistContext.Provider
            value={{
                watchlists,
                loading,
                refreshWatchlists,
                createWatchlist,
                addToWatchlist,
                removeFromWatchlist,
                deleteWatchlist,
                isInWatchlist,
            }}>
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    const context = useContext(WatchlistContext);
    if (!context) {
        throw new Error('useWatchlist must be used within WatchlistProvider');
    }
    return context;
}
