import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS, CACHE_EXPIRATION } from '../constants/api';
import {
    TopGainersLosersResponse,
    CompanyOverview,
    SearchResponse,
    TimeSeriesData,
    IPOData,
    EarningsData,
    NewsResponse,
    IndicatorData,
    QuoteData,
    MarketStatusResponse,
} from '../types';
import { getCache, setCache } from '../utils/cache';

const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: 10000,
});

/**
 * Simple CSV Parser for Alpha Vantage results
 */
function parseCSV(csv: string): string[][] {
    return csv.split('\n')
        .map(row => row.split(','))
        .filter(row => row.length > 1);
}

/**
 * Fetch top gainers and losers
 */
export async function fetchTopGainersLosers(forceRefresh: boolean = false): Promise<TopGainersLosersResponse> {
    const cacheKey = 'top_gainers_losers';

    if (!forceRefresh) {
        const cached = await getCache<TopGainersLosersResponse>(cacheKey);
        if (cached) return cached;
    }

    try {
        console.log('Fetching live Top Gainers/Losers...');
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.TOP_GAINERS_LOSERS,
                apikey: API_CONFIG.API_KEY,
            },
        });

        const data = response.data;

        // Alpha Vantage Rate Limit / Usage Limit detection
        if (data.Note || data.Information) {
            console.warn('Alpha Vantage API Notice:', data.Note || data.Information);
            // We return an object with the message so the UI can show it
            return {
                top_gainers: [],
                top_losers: [],
                most_actively_traded: [],
                metadata: data.Note || data.Information, // Store the error message here
                last_updated: ''
            };
        }

        if (data['Error Message']) {
            console.error('API Error:', data['Error Message']);
            return { top_gainers: [], top_losers: [], most_actively_traded: [], metadata: 'ERROR', last_updated: '' };
        }

        await setCache(cacheKey, data, CACHE_EXPIRATION.TOP_GAINERS_LOSERS);
        return data;
    } catch (error) {
        console.error('Network Error fetching gainers:', error);
        return { top_gainers: [], top_losers: [], most_actively_traded: [], metadata: 'NETWORK_ERROR', last_updated: '' };
    }
}

/**
 * Fetch company overview
 */
export async function fetchCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
    const cacheKey = `company_overview_${symbol}`;
    const cached = await getCache<CompanyOverview>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.COMPANY_OVERVIEW,
                symbol,
                apikey: API_CONFIG.API_KEY,
            },
        });
        const data = response.data;
        if (data.Note || data.Information || data['Error Message']) return null;
        await setCache(cacheKey, data, CACHE_EXPIRATION.COMPANY_OVERVIEW);
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * Search for stocks/ETFs
 */
export async function searchSymbols(keywords: string): Promise<SearchResponse> {
    const cacheKey = `search_${keywords}`;
    const cached = await getCache<SearchResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.SYMBOL_SEARCH,
                keywords,
                apikey: API_CONFIG.API_KEY,
            },
        });
        const data = response.data;
        if (data.Note || data.Information) return { bestMatches: [] };
        await setCache(cacheKey, data, CACHE_EXPIRATION.SEARCH);
        return data;
    } catch (error) {
        return { bestMatches: [] };
    }
}

/**
 * Fetch time series data for charts
 */
export async function fetchTimeSeriesDaily(symbol: string): Promise<TimeSeriesData[]> {
    const cacheKey = `time_series_${symbol}`;
    const cached = await getCache<TimeSeriesData[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.TIME_SERIES_DAILY,
                symbol,
                apikey: API_CONFIG.API_KEY,
                outputsize: 'compact',
            },
        });
        const data = response.data;
        if (data.Note || data.Information || data['Error Message']) return [];
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) return [];
        const timeSeriesData: TimeSeriesData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
            date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseFloat(values['5. volume']),
        }));
        timeSeriesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await setCache(cacheKey, timeSeriesData, CACHE_EXPIRATION.TIME_SERIES);
        return timeSeriesData;
    } catch (error) {
        return [];
    }
}

/**
 * Fetch IPO Calendar
 */
export async function fetchIPOCalendar(): Promise<IPOData[]> {
    const cacheKey = 'ipo_calendar';
    const cached = await getCache<IPOData[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', { params: { function: API_ENDPOINTS.IPO_CALENDAR, apikey: API_CONFIG.API_KEY } });
        if (typeof response.data !== 'string') return [];
        const rows = parseCSV(response.data);
        const data: IPOData[] = rows.slice(1).map(row => ({
            symbol: row[0], name: row[1], ipoDate: row[2], priceRangeLow: row[3], priceRangeHigh: row[4], exchange: row[6],
        }));
        await setCache(cacheKey, data, 24 * 60 * 60 * 1000);
        return data;
    } catch (error) {
        return [];
    }
}

/**
 * Fetch Earnings Calendar
 */
export async function fetchEarningsCalendar(): Promise<EarningsData[]> {
    const cacheKey = 'earnings_calendar';
    const cached = await getCache<EarningsData[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', { params: { function: API_ENDPOINTS.EARNINGS_CALENDAR, horizon: '3month', apikey: API_CONFIG.API_KEY } });
        if (typeof response.data !== 'string') return [];
        const rows = parseCSV(response.data);
        const data: EarningsData[] = rows.slice(1).map(row => ({
            symbol: row[0], name: row[1], reportDate: row[2], fiscalDateEnding: row[3], estimate: row[4], currency: row[5],
        }));
        await setCache(cacheKey, data, 12 * 60 * 60 * 1000);
        return data;
    } catch (error) {
        return [];
    }
}

/**
 * Fetch Market News and Sentiment
 */
export async function fetchMarketNews(symbol?: string): Promise<NewsResponse | null> {
    const cacheKey = `news_${symbol || 'global'}`;
    const cached = await getCache<NewsResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.NEWS_SENTIMENT,
                tickers: symbol,
                apikey: API_CONFIG.API_KEY,
                limit: 50,
            },
        });
        const data = response.data;
        if (data.Note || data.Information) return null;
        await setCache(cacheKey, data, 30 * 60 * 1000); // 30 mins cache
        return data;
    } catch (error) {
        return null;
    }
}

/**
 * Fetch Technical Indicator: SMA (Simple Moving Average)
 */
export async function fetchSMA(symbol: string): Promise<IndicatorData[]> {
    const cacheKey = `sma_${symbol}`;
    const cached = await getCache<IndicatorData[]>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.SMA,
                symbol,
                interval: 'daily',
                time_period: 20,
                series_type: 'close',
                apikey: API_CONFIG.API_KEY,
            },
        });
        const data = response.data;
        if (data.Note || data.Information || !data['Technical Analysis: SMA']) return [];
        const smaData = data['Technical Analysis: SMA'];
        const formatted: IndicatorData[] = Object.entries(smaData).map(([date, values]: [string, any]) => ({
            date,
            value: parseFloat(values.SMA),
        }));
        formatted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        await setCache(cacheKey, formatted, CACHE_EXPIRATION.TIME_SERIES);
        return formatted;
    } catch (error) {
        return [];
    }
}

/**
 * Fetch Global Quote for a symbol
 */
export async function fetchGlobalQuote(symbol: string): Promise<QuoteData | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = await getCache<QuoteData>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.GLOBAL_QUOTE,
                symbol,
                apikey: API_CONFIG.API_KEY,
            },
        });
        const data = response.data['Global Quote'];
        if (!data || Object.keys(data).length === 0) return null;

        const quote: QuoteData = {
            symbol: data['01. symbol'],
            price: data['05. price'],
            change: data['09. change'],
            changePercent: data['10. change percent'],
            volume: data['06. volume'],
            latestTradingDay: data['07. latest trading day'],
        };

        await setCache(cacheKey, quote, 5 * 60 * 1000); // 5 mins cache
        return quote;
    } catch (error) {
        return null;
    }
}

/**
 * Fetch Market Status
 */
export async function fetchMarketStatus(): Promise<MarketStatusResponse | null> {
    const cacheKey = 'market_status';
    const cached = await getCache<MarketStatusResponse>(cacheKey);
    if (cached) return cached;

    try {
        const response = await api.get('', {
            params: {
                function: API_ENDPOINTS.MARKET_STATUS,
                apikey: API_CONFIG.API_KEY,
            },
        });
        const data = response.data;
        if (data.Note || data.Information) return null;

        await setCache(cacheKey, data, 10 * 60 * 1000); // 10 mins cache
        return data;
    } catch (error) {
        return null;
    }
}
