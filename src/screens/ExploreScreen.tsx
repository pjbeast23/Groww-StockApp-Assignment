import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Image,
    Dimensions,
    FlatList,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Stock, SearchResult, NewsItem, QuoteData, MarketStatus } from '../types';
import { useTheme } from '../context/ThemeContext';
import { fetchTopGainersLosers, searchSymbols, fetchMarketNews, fetchGlobalQuote, fetchMarketStatus } from '../services/api';
import { StockCard } from '../components/StockCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const FALLBACK_GAINERS: Stock[] = [
    { ticker: 'NVDA', name: 'NVIDIA Corp', price: '135.58', change_amount: '4.21', change_percentage: '3.21%', volume: '45.2M' },
    { ticker: 'AAPL', name: 'Apple Inc', price: '228.22', change_amount: '3.12', change_percentage: '1.38%', volume: '32.1M' },
    { ticker: 'TSLA', name: 'Tesla Inc', price: '248.42', change_amount: '12.45', change_percentage: '5.28%', volume: '88.4M' },
    { ticker: 'GOOGL', name: 'Alphabet Inc', price: '182.12', change_amount: '2.14', change_percentage: '1.18%', volume: '18.2M' },
];

const FALLBACK_LOSERS: Stock[] = [
    { ticker: 'NFLX', name: 'Netflix Inc', price: '682.11', change_amount: '-15.42', change_percentage: '-2.21%', volume: '8.4M' },
    { ticker: 'AMZN', name: 'Amazon.com Inc', price: '188.10', change_amount: '-4.12', change_percentage: '-2.14%', volume: '22.1M' },
    { ticker: 'MSFT', name: 'Microsoft Corp', price: '412.01', change_amount: '-8.42', change_percentage: '-2.01%', volume: '14.2M' },
    { ticker: 'META', name: 'Meta Platforms', price: '524.21', change_amount: '-12.05', change_percentage: '-2.28%', volume: '12.4M' },
];

const FALLBACK_NEWS: NewsItem[] = [
    {
        title: "Federal Reserve Holds Rates Steady, Hints at Future Cuts",
        url: "https://www.cnbc.com",
        time_published: "20260118T020000",
        authors: ["CNBC Staff"],
        summary: "The Federal Reserve maintained interest rates at their current levels while suggesting that inflation is cooling.",
        banner_image: "https://images.unsplash.com/photo-1611974715853-2b8ef955d8bb?q=80&w=400",
        source: "CNBC",
        overall_sentiment_label: "Neutral",
        overall_sentiment_score: 0.1
    },
    {
        title: "Tech Giants Report Record Earnings Amid AI Surge",
        url: "https://www.bloomberg.com",
        time_published: "20260118T013000",
        authors: ["Bloomberg"],
        summary: "Major technology companies have exceeded analyst expectations as artificial intelligence continues to drive growth.",
        banner_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400",
        source: "Bloomberg",
        overall_sentiment_label: "Bullish",
        overall_sentiment_score: 0.8
    }
];

const PRODUCTS = [
    { id: 'fo', name: 'F&O', icon: '📈' },
    { id: 'events', name: 'Events', icon: '📅' },
    { id: 'ipo', name: 'IPO', icon: '🚀' },
    { id: 'all', name: 'All Stocks', icon: '🏛️' },
];

const INDEX_TICKERS = ['SPY', 'QQQ', 'DIA']; // S&P 500, Nasdaq, Dow Jones

export function ExploreScreen() {
    const { theme, toggleTheme, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp>();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [topGainers, setTopGainers] = useState<Stock[]>([]);
    const [topLosers, setTopLosers] = useState<Stock[]>([]);
    const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
    const [indices, setIndices] = useState<QuoteData[]>([]);
    const [marketStatus, setMarketStatus] = useState<string>('Market Closed');
    const [isDemo, setIsDemo] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 1) {
                handleSearch(searchQuery.trim());
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const loadData = async (force: boolean = false) => {
        try {
            setError(null);

            // Parallel fetch for main data
            // We fetch the most important ones first
            const [topData, newsData, statusData] = await Promise.all([
                fetchTopGainersLosers(force),
                fetchMarketNews(undefined),
                fetchMarketStatus()
            ]);

            // Then fetch indices (to avoid hitting rate limit too fast on parallel)
            const indexQuotes = await Promise.all(
                INDEX_TICKERS.map(ticker => fetchGlobalQuote(ticker))
            );

            // Set Top Gainers with Fallback
            if (topData.top_gainers && topData.top_gainers.length > 0) {
                setTopGainers(topData.top_gainers);
                setIsDemo(false);
            } else {
                setTopGainers(FALLBACK_GAINERS);
                setIsDemo(true);

                // If Alpha Vantage provided a Note, Alert the user so they know WHY it's demo
                if (topData.metadata && topData.metadata !== '' && force) {
                    Alert.alert('API Notice', topData.metadata);
                }
            }

            // Set Top Losers with Fallback
            if (topData.top_losers && topData.top_losers.length > 0) {
                setTopLosers(topData.top_losers);
            } else {
                setTopLosers(FALLBACK_LOSERS);
            }

            // Set News
            if (newsData?.feed && newsData.feed.length > 0) {
                setMarketNews(newsData.feed.slice(0, 10));
            } else {
                setMarketNews(FALLBACK_NEWS);
            }

            // Set Indices
            setIndices(indexQuotes.filter((q): q is QuoteData => q !== null));

            // Set US Market Status
            const usMarket = statusData?.markets?.find(m => m.region === 'United States');
            if (usMarket) {
                setMarketStatus(usMarket.current_status === 'open' ? 'Market Open' : 'Market Closed');
            }

        } catch (err) {
            console.error('Data loading error:', err);
            // Even on error, show fallbacks so screen isn't empty
            setTopGainers(FALLBACK_GAINERS);
            setTopLosers(FALLBACK_LOSERS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const data = await searchSymbols(query);
            setSearchResults(data.bestMatches || []);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true); // Force bypass cache on pull-to-refresh
    };

    const handleStockPress = (stock: Stock) => {
        navigation.navigate('ProductDetails', {
            ticker: stock.ticker,
            name: stock.name,
        });
    };

    const handleIndexPress = (ticker: string) => {
        navigation.navigate('ProductDetails', { ticker });
    };

    const handleNewsPress = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const handleSearchResultPress = (result: SearchResult) => {
        setSearchQuery('');
        setSearchResults([]);
        navigation.navigate('ProductDetails', {
            ticker: result['1. symbol'],
            name: result['2. name'],
        });
    };

    const handleViewAll = (type: 'gainers' | 'losers', title: string, data: Stock[]) => {
        navigation.navigate('ViewAll', { type, title, data });
    };

    const handleProductPress = (id: string) => {
        switch (id) {
            case 'fo': navigation.navigate('FO'); break;
            case 'ipo': navigation.navigate('IPO'); break;
            case 'events': navigation.navigate('Events'); break;
            case 'all': navigation.navigate('AllStocks'); break;
        }
    };

    if (loading) {
        return <LoadingState message="Connecting to Live Markets..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={loadData} />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Exact Groww Header Style */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}>
                    <Text style={{ fontSize: 12 }}>👤</Text>
                </View>

                <View style={[styles.searchWrapper, { backgroundColor: theme.surfaceSecondary }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search stocks, indices..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
                </View>

                <View style={[styles.marketStatusPill, { backgroundColor: marketStatus === 'Market Open' ? theme.gain + '20' : theme.loss + '20' }]}>
                    <Text style={[styles.marketStatusText, { color: marketStatus === 'Market Open' ? theme.gain : theme.loss }]}>
                        {marketStatus}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.themeToggle, { backgroundColor: isDark ? '#FFF' : '#000' }]}
                    onPress={toggleTheme}>
                    <Text style={[styles.themeToggleText, { color: isDark ? '#000' : '#FFF' }]}>
                        {isDark ? 'LIGHT' : 'DARK'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Results Overlay */}
            {searchResults.length > 0 && (
                <View style={[styles.resultsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item['1. symbol']}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.resultItem, { borderBottomColor: theme.border }]}
                                onPress={() => handleSearchResultPress(item)}>
                                <Text style={[styles.resultSymbol, { color: theme.text }]}>{item['1. symbol']}</Text>
                                <Text style={[styles.resultName, { color: theme.textSecondary }]} numberOfLines={1}>{item['2. name']}</Text>
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: 400 }}
                    />
                </View>
            )}

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }>

                {/* Dynamic Index Highlights (SPY, QQQ, DIA) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.indicesScroll}
                    decelerationRate="fast"
                    snapToInterval={width * 0.45 + SPACING.md}
                >
                    {indices.map((index, i) => {
                        const isGaining = parseFloat(index.change) >= 0;
                        return (
                            <TouchableOpacity
                                key={i}
                                style={[styles.indexCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => handleIndexPress(index.symbol)}>
                                <Text style={[styles.indexName, { color: theme.textSecondary }]}>{index.symbol === 'SPY' ? 'S&P 500' : index.symbol === 'QQQ' ? 'NASDAQ 100' : 'DOW JONES'}</Text>
                                <Text style={[styles.indexValue, { color: theme.text }]}>${parseFloat(index.price).toFixed(2)}</Text>
                                <Text style={[styles.indexChange, { color: isGaining ? theme.gain : theme.loss }]}>
                                    {isGaining ? '+' : ''}{parseFloat(index.change).toFixed(2)} ({index.changePercent})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Products & Tools */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Products & Tools</Text>
                    </View>
                    <View style={styles.productsGrid}>
                        {PRODUCTS.map((prod) => (
                            <TouchableOpacity
                                key={prod.id}
                                style={styles.productItem}
                                onPress={() => handleProductPress(prod.id)}>
                                <View style={[styles.productIconWrapper, { backgroundColor: isDark ? '#262626' : '#F1F5F9' }]}>
                                    <Text style={styles.productIcon}>{prod.icon}</Text>
                                </View>
                                <Text style={[styles.productName, { color: theme.textSecondary }]}>{prod.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Top Gainers Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Gainers</Text>
                            <View style={[styles.dataTag, { backgroundColor: isDemo ? theme.surfaceSecondary : theme.gain + '20' }]}>
                                <Text style={[styles.dataTagText, { color: isDemo ? theme.textSecondary : theme.gain }]}>
                                    {isDemo ? 'DEMO DATA' : '● LIVE'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleViewAll('gainers', 'Top Gainers', topGainers)}>
                            <Text style={[styles.viewAllText, { color: theme.primary }]}>VIEW ALL</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grid}>
                        {topGainers.slice(0, 4).map((stock, index) => (
                            <StockCard
                                key={index}
                                variant="square"
                                stock={stock}
                                onPress={() => handleStockPress(stock)}
                            />
                        ))}
                    </View>
                </View>

                {/* Top Losers Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Losers</Text>
                            <View style={[styles.dataTag, { backgroundColor: isDemo ? theme.surfaceSecondary : theme.loss + '20' }]}>
                                <Text style={[styles.dataTagText, { color: isDemo ? theme.textSecondary : theme.loss }]}>
                                    {isDemo ? 'DEMO DATA' : '● LIVE'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleViewAll('losers', 'Top Losers', topLosers)}>
                            <Text style={[styles.viewAllText, { color: theme.primary }]}>VIEW ALL</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grid}>
                        {topLosers.slice(0, 4).map((stock, index) => (
                            <StockCard
                                key={index}
                                variant="square"
                                stock={stock}
                                onPress={() => handleStockPress(stock)}
                            />
                        ))}
                    </View>
                </View>

                {/* Market News Section */}
                {marketNews.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Market News</Text>
                        </View>
                        {marketNews.map((news, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.newsCard, { borderBottomColor: theme.border }]}
                                onPress={() => handleNewsPress(news.url)}>
                                <View style={styles.newsContent}>
                                    <View style={styles.newsTextContainer}>
                                        <View style={styles.newsSourceRow}>
                                            <Text style={[styles.newsSource, { color: theme.primary }]}>{news.source}</Text>
                                            <View style={[
                                                styles.sentimentBadge,
                                                { backgroundColor: news.overall_sentiment_label?.includes('Bullish') ? theme.gain + '20' : news.overall_sentiment_label?.includes('Bearish') ? theme.loss + '20' : theme.surfaceSecondary }
                                            ]}>
                                                <Text style={[
                                                    styles.sentimentText,
                                                    { color: news.overall_sentiment_label?.includes('Bullish') ? theme.gain : news.overall_sentiment_label?.includes('Bearish') ? theme.loss : theme.textSecondary }
                                                ]}>
                                                    {news.overall_sentiment_label}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={[styles.newsTitle, { color: theme.text }]} numberOfLines={2}>
                                            {news.title}
                                        </Text>
                                        <Text style={[styles.newsTime, { color: theme.textSecondary }]}>
                                            {new Date(news.time_published.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6')).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    {news.banner_image ? (
                                        <Image source={{ uri: news.banner_image }} style={styles.newsImage} />
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingTop: 10,
        paddingBottom: 15,
        borderBottomWidth: 0.5,
    },
    profileAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        padding: 0,
    },
    themeToggle: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    themeToggleText: {
        fontSize: 10,
        fontWeight: '800',
    },
    marketStatusPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 10,
    },
    marketStatusText: {
        fontSize: 8,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    scrollView: {
        flex: 1,
    },
    indicesScroll: {
        paddingVertical: SPACING.md,
        paddingLeft: SPACING.md,
    },
    indexCard: {
        width: width * 0.42,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    indexName: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 6,
    },
    indexValue: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    indexChange: {
        fontSize: 11,
        fontWeight: '600',
    },
    section: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
    },
    dataTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    dataTagText: {
        fontSize: 8,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    viewAllText: {
        fontSize: 11,
        fontWeight: '800',
    },
    productsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    productItem: {
        alignItems: 'center',
        width: '22%',
    },
    productIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    productIcon: {
        fontSize: 22,
    },
    productName: {
        fontSize: 11,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    resultsContainer: {
        position: 'absolute',
        top: 65,
        left: SPACING.md,
        right: SPACING.md,
        borderRadius: 12,
        padding: 4,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        zIndex: 1000,
    },
    resultItem: {
        padding: 15,
        borderBottomWidth: 0.5,
    },
    resultSymbol: {
        fontSize: 14,
        fontWeight: '800',
    },
    resultName: {
        fontSize: 12,
        fontWeight: '500',
    },
    newsCard: {
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    newsContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    newsTextContainer: {
        flex: 1,
        paddingRight: 12,
    },
    newsSourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    newsSource: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    sentimentBadge: {
        marginLeft: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    sentimentText: {
        fontSize: 8,
        fontWeight: '800',
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: '700',
        lineHeight: 20,
        marginBottom: 8,
    },
    newsTime: {
        fontSize: 10,
        fontWeight: '600',
    },
    newsImage: {
        width: 80,
        height: 60,
        borderRadius: 8,
    },
});
