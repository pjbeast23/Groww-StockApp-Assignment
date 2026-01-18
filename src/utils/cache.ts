import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheItem } from '../types';

const CACHE_PREFIX = '@stock_app_cache:';

/**
 * Save data to cache with expiration
 */
export async function setCache<T>(
    key: string,
    data: T,
    expirationMs: number,
): Promise<void> {
    try {
        const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + expirationMs,
        };
        await AsyncStorage.setItem(
            `${CACHE_PREFIX}${key}`,
            JSON.stringify(cacheItem),
        );
    } catch (error) {
        console.error('Error setting cache:', error);
    }
}

/**
 * Get data from cache if not expired
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
        if (!cached) {
            return null;
        }

        const cacheItem: CacheItem<T> = JSON.parse(cached);

        // Check if cache has expired
        if (Date.now() > cacheItem.expiresAt) {
            await clearCache(key);
            return null;
        }

        return cacheItem.data;
    } catch (error) {
        console.error('Error getting cache:', error);
        return null;
    }
}

/**
 * Clear specific cache item
 */
export async function clearCache(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
        await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
        console.error('Error clearing all cache:', error);
    }
}
