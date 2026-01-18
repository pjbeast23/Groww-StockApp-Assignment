// Stock/ETF data types
export interface Stock {
    ticker: string;
    name?: string;
    price: string;
    change_amount: string;
    change_percentage: string;
    volume: string;
}

export interface QuoteData {
    symbol: string;
    price: string;
    change: string;
    changePercent: string;
    volume: string;
    latestTradingDay: string;
}

export interface MarketStatus {
    market_type: string;
    region: string;
    primary_exchanges: string;
    local_open: string;
    local_close: string;
    current_status: string;
    notes: string;
}

export interface MarketStatusResponse {
    endpoint: string;
    markets: MarketStatus[];
}

export interface CompanyOverview {
    Symbol: string;
    Name: string;
    Description: string;
    Exchange: string;
    Currency: string;
    Country: string;
    Sector: string;
    Industry: string;
    MarketCapitalization: string;
    PERatio: string;
    DividendYield: string;
    '52WeekHigh': string;
    '52WeekLow': string;
}

export interface TimeSeriesData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface TopGainersLosersResponse {
    metadata: string;
    last_updated: string;
    top_gainers: Stock[];
    top_losers: Stock[];
    most_actively_traded: Stock[];
}

export interface SearchResult {
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
}

export interface SearchResponse {
    bestMatches: SearchResult[];
}

export interface IPOData {
    symbol: string;
    name: string;
    ipoDate: string;
    priceRangeLow: string;
    priceRangeHigh: string;
    exchange: string;
}

export interface EarningsData {
    symbol: string;
    name: string;
    reportDate: string;
    fiscalDateEnding: string;
    estimate: string;
    currency: string;
}

export interface NewsItem {
    title: string;
    url: string;
    time_published: string;
    authors: string[];
    summary: string;
    banner_image: string;
    source: string;
    overall_sentiment_label: string;
    overall_sentiment_score: number;
}

export interface NewsResponse {
    items: string;
    sentiment_score_definition: string;
    relevance_score_definition: string;
    feed: NewsItem[];
}

export interface IndicatorData {
    date: string;
    value: number;
}

// Watchlist types
export interface Watchlist {
    id: string;
    name: string;
    stocks: string[]; // Array of ticker symbols
    createdAt: number;
}

// Navigation types
export type RootStackParamList = {
    MainTabs: undefined;
    ProductDetails: {
        ticker: string;
        name?: string;
    };
    ViewAll: {
        type: 'gainers' | 'losers' | 'active';
        title: string;
        data: Stock[];
    };
    IPO: undefined;
    Events: undefined;
    FO: undefined;
    AllStocks: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Watchlist: undefined;
};

// Cache types
export interface CacheItem<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}
