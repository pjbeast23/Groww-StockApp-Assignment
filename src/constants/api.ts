import { ALPHA_VANTAGE_API_KEY } from '@env';

// Alpha Vantage API Configuration
// Get your free API key from: https://www.alphavantage.co/support/#api-key

export const API_CONFIG = {
    BASE_URL: 'https://www.alphavantage.co/query',
    API_KEY: ALPHA_VANTAGE_API_KEY, // Loaded from .env file
    // Free tier limits: 25 requests/day, 5 requests/minute
    RATE_LIMIT: {
        PER_MINUTE: 5,
        PER_DAY: 25,
    },
};

export const API_ENDPOINTS = {
    TOP_GAINERS_LOSERS: 'TOP_GAINERS_LOSERS',
    COMPANY_OVERVIEW: 'OVERVIEW',
    SYMBOL_SEARCH: 'SYMBOL_SEARCH',
    TIME_SERIES_DAILY: 'TIME_SERIES_DAILY',
    TIME_SERIES_INTRADAY: 'TIME_SERIES_INTRADAY',
    IPO_CALENDAR: 'IPO_CALENDAR',
    EARNINGS_CALENDAR: 'EARNING_CALENDAR',
    NEWS_SENTIMENT: 'NEWS_SENTIMENT',
    SMA: 'SMA',
    GLOBAL_QUOTE: 'GLOBAL_QUOTE',
    MARKET_STATUS: 'MARKET_STATUS',
};

// Cache expiration times (in milliseconds)
export const CACHE_EXPIRATION = {
    TOP_GAINERS_LOSERS: 30 * 60 * 1000, // 30 minutes (Save credits!)
    COMPANY_OVERVIEW: 24 * 60 * 60 * 1000, // 24 hours
    TIME_SERIES: 15 * 60 * 1000, // 15 minutes
    SEARCH: 60 * 60 * 1000, // 1 hour
};
